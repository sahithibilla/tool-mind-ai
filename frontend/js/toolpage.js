// Tool detail page: load tool info from local tools.json using ?id= query param,
// then fetch and render the corresponding README.md via the Flask backend.
const API_BASE = "https://tool-mind-ai-1.onrender.com";

(function () {
  window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const loader = document.getElementById("tool-loader");
    const content = document.getElementById("tool-content");
    const errorEl = document.getElementById("tool-error");
    const nameEl = document.getElementById("tool-name");
    const catEl = document.getElementById("tool-category");
    const descEl = document.getElementById("tool-description");
    const websiteEl = document.getElementById("tool-website");
    const readmeLoader = document.getElementById("tool-readme-loader");
    const readmeError = document.getElementById("tool-readme-error");
    const readmeEl = document.getElementById("tool-readme");
    const yearSpan = document.getElementById("year");

    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear().toString();
    }

    if (!id) {
      showError("No tool specified. Please go back and select a tool.");
      return;
    }

    // Load tool metadata from local tools.json
    fetch("data/tools.json")
      .then((res) => res.json())
      .then((tools) => {
        const tool = tools.find((t) => String(t.id) === String(id));
        if (!tool) {
          showError("Tool not found. It may have been removed.");
          return;
        }
        loader.style.display = "none";
        content.hidden = false;

        nameEl.textContent = tool.name;
        catEl.textContent = tool.category;
        descEl.textContent = tool.description;
        websiteEl.href = tool.website;

        // Fetch README content from backend
        fetchToolReadme(tool.id);
      })
      .catch((err) => {
        console.error(err);
        showError("Failed to load tool details. Please try again.");
      });

    function fetchToolReadme(toolId) {
      const url = `${API_BASE}/tool-readme?tool=${encodeURIComponent(toolId)}`;
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const markdown = data.markdown || "";
          readmeLoader.style.display = "none";

          if (!markdown.trim()) {
            readmeError.hidden = false;
            readmeError.textContent = "README is empty for this tool.";
            return;
          }

          const html =
            window.marked && typeof window.marked.parse === "function"
              ? window.marked.parse(markdown)
              : markdown.replace(/\n/g, "<br/>");

          readmeEl.innerHTML = html;
          readmeEl.hidden = false;
        })
        .catch((err) => {
          console.error(err);
          readmeLoader.style.display = "none";
          readmeError.hidden = false;
          readmeError.textContent =
            "Detailed README could not be loaded for this tool.";
        });
    }

    function showError(msg) {
      loader.style.display = "none";
      content.hidden = true;
      errorEl.hidden = false;
      errorEl.textContent = msg;
    }
  });
})();

