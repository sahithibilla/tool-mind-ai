import json
import os
import pickle
import csv
from dataclasses import dataclass
from typing import List, Optional
from flask import send_from_directory

from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOOLS_PATH = os.path.join(BASE_DIR, "..", "frontend", "data", "tools.json")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
CSV_PATH = os.path.join(PROJECT_ROOT, "AI-TOOLS - Sheet1.csv")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@dataclass
class ToolItem:
  id: str
  name: str
  category: str
  description: str
  website: str


@dataclass
class RecommendModel:
  vectorizer: TfidfVectorizer
  matrix: any
  tools: List[ToolItem]

  def encode_query(self, text: str):
    return self.vectorizer.transform([text])

  def recommend(self, query: str, top_k: int = 5):
    if not query.strip():
      return []

    query_vec = self.encode_query(query)
    sims = cosine_similarity(query_vec, self.matrix)[0]
    scored = list(enumerate(sims))
    scored.sort(key=lambda x: x[1], reverse=True)
    results = []
    for idx, score in scored[:top_k]:
      tool = self.tools[idx]
      results.append(
        {
          "id": tool.id,
          "name": tool.name,
          "category": tool.category,
          "description": tool.description,
          "link": tool.website,
          "score": float(score),
        }
      )
    return results


def load_tools() -> List[ToolItem]:
  with open(TOOLS_PATH, "r", encoding="utf-8") as f:
    raw = json.load(f)
  tools: List[ToolItem] = []
  for t in raw:
    tools.append(
      ToolItem(
        id=str(t.get("id", "")),
        name=t.get("name", ""),
        category=t.get("category", ""),
        description=t.get("description", ""),
        website=t.get("website", ""),
      )
    )
  return tools


def _norm_name(name: str) -> str:
  return " ".join((name or "").strip().split()).lower()


def load_tool_extras_from_csv() -> dict:
  """
  Load extra fields (uses, unique feature, free/paid) from the original CSV.
  Returns a dict keyed by normalized tool name.
  """
  extras: dict = {}
  if not os.path.exists(CSV_PATH):
    return extras

  try:
    with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
      reader = csv.DictReader(f)
      for row in reader:
        tool_name = row.get("Tool Name", "") or ""
        key = _norm_name(tool_name)
        if not key:
          continue
        extras[key] = {
          "uses": (row.get("Uses", "") or "").strip(),
          "uniqueFeature": (row.get("Unique Feature", "") or "").strip(),
          "pricing": (row.get("Free/Paid", "") or "").strip(),
        }
  except OSError:
    return {}

  return extras


_extras_cache: Optional[dict] = None


def get_extras_cache() -> dict:
  global _extras_cache
  if _extras_cache is None:
    _extras_cache = load_tool_extras_from_csv()
  return _extras_cache


def get_tool_by_id(tool_id: str) -> Optional[ToolItem]:
  tools = load_tools()
  for t in tools:
    if str(t.id) == str(tool_id):
      return t
  return None


def map_category_to_readme_dir(category: str) -> Optional[str]:
  """
  Map normalized category from tools.json to the existing
  directory structure that stores individual README.md files.
  """
  mapping = {
    "Writing AI": "TEXT AI",
    "Image AI": "IMAGE AI",
    "Video AI": "VIDEO AI",
    "Voice AI": "Audio(Voice) AI Tools",
    "Coding AI": "CODING AI",
    "Research AI": "RESEARCH AI",
    "Productivity AI": "PRODUCTIVITY AI",
    "design AI": "Design AI",
    "Marketing AI": "Marketing AI",
    "Education/career/resume AI": "RESUME - CAREER AI",
  }
  return mapping.get(category)


def find_readme_for_tool(tool: ToolItem) -> Optional[str]:
  """
  Locate the README.md file for a given tool.
  We attempt a direct category-based lookup first, then fall back
  to a recursive search under PROJECT_ROOT matching the tool folder
  name case-insensitively.
  """
  category_dir = map_category_to_readme_dir(tool.category)

  # Direct category-based lookup (fast path)
  if category_dir:
    candidate = os.path.join(PROJECT_ROOT, category_dir, tool.name, "README.md")
    if os.path.exists(candidate):
      return candidate

    category_path = os.path.join(PROJECT_ROOT, category_dir)
    if os.path.isdir(category_path):
      try:
        for entry in os.listdir(category_path):
          if entry.lower() == tool.name.lower():
            candidate2 = os.path.join(category_path, entry, "README.md")
            if os.path.exists(candidate2):
              return candidate2
      except OSError:
        pass

  # Fallback: walk the whole project tree and look for a README.md
  # whose parent directory matches the tool name (case-insensitive).
  target_name = tool.name.lower()
  for root, dirs, files in os.walk(PROJECT_ROOT):
    if "README.md" not in files:
      continue
    parent = os.path.basename(root).lower()
    if parent == target_name:
      return os.path.join(root, "README.md")

  return None


def build_and_save_model() -> RecommendModel:
  tools = load_tools()
  documents = [
    f"{tool.name} {tool.category} {tool.description}" for tool in tools
  ]
  vectorizer = TfidfVectorizer(stop_words="english")
  matrix = vectorizer.fit_transform(documents)
  model = RecommendModel(vectorizer=vectorizer, matrix=matrix, tools=tools)
  with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)
  return model


def load_model() -> RecommendModel:
  """
  Try to load an existing trained model from model.pkl.
  If it's missing, train a TF‑IDF model on tools.json and save it.
  This allows the site to work even before a custom model is provided.
  """
  if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
      model = pickle.load(f)
    return model
  return build_and_save_model()


# Lazily initialized model
_model: RecommendModel | None = None


def get_model() -> RecommendModel:
  global _model
  if _model is None:
    _model = load_model()
  return _model


@app.get("/health")
def health():
  return jsonify({"status": "ok"})


@app.get("/recommend")
def recommend():
  """
  Recommend tools based on a natural language query.

  Usage:
    GET /recommend?query=generate images with AI

  Response:
    [
      {
        "id": "...",
        "name": "Midjourney",
        "category": "Image AI",
        "description": "Generate high quality AI images from prompts",
        "link": "https://midjourney.com",
        "score": 0.82
      },
      ...
    ]
  """
  query = request.args.get("query", "").strip()
  if not query:
    return jsonify([])

  model = get_model()
  results = model.recommend(query, top_k=5)
  return jsonify(results)


@app.get("/tool-readme")
def tool_readme():
  """
  Return the full README.md markdown content for a given tool.

  Usage:
    GET /tool-readme?id=chatgpt
  """
  tool_id = request.args.get("id", "").strip()
  if not tool_id:
    return jsonify({"error": "Missing id parameter"}), 400

  tool = get_tool_by_id(tool_id)
  if not tool:
    return jsonify({"error": "Tool not found"}), 404

  readme_path = find_readme_for_tool(tool)
  if not readme_path or not os.path.exists(readme_path):
    return jsonify({"error": "README not found for this tool"}), 404

  try:
    with open(readme_path, "r", encoding="utf-8") as f:
      markdown = f.read()
  except OSError:
    return jsonify({"error": "Failed to read README file"}), 500

  return jsonify(
    {
      "id": tool.id,
      "name": tool.name,
      "category": tool.category,
      "markdown": markdown,
    }
  )


@app.get("/tool-extra")
def tool_extra():
  """
  Return extra CSV fields for one or more tool ids.

  Usage:
    GET /tool-extra?ids=chatgpt,notion-ai
  """
  raw_ids = (request.args.get("ids", "") or "").strip()
  if not raw_ids:
    return jsonify([])

  ids = [s.strip() for s in raw_ids.split(",") if s.strip()]
  if not ids:
    return jsonify([])

  tools_by_id = {t.id: t for t in load_tools()}
  extras = get_extras_cache()

  out = []
  for tool_id in ids[:50]:
    t = tools_by_id.get(tool_id)
    if not t:
      continue
    extra = extras.get(_norm_name(t.name), {})
    out.append(
      {
        "id": t.id,
        "uses": extra.get("uses", ""),
        "uniqueFeature": extra.get("uniqueFeature", ""),
        "pricing": extra.get("pricing", ""),
      }
    )

  return jsonify(out)



@app.route("/")
def serve_index():
    return send_from_directory(os.path.join(BASE_DIR, "..", "frontend"), "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(os.path.join(BASE_DIR, "..", "frontend"), path)

if __name__ == "__main__":
  port = int(os.environ.get("PORT", "5000"))
  app.run(host="0.0.0.0", port=port, debug=True)
