# 🧠 TOOLMIND

### Discover • Learn • Find the Right AI Tool

**TOOLMIND** is an intelligent platform designed to help users **discover, learn, and choose the right AI tools** for their needs.
With hundreds of AI tools emerging every year, it can be difficult to know which tool is best for a specific task. TOOLMIND solves this problem by combining a **curated AI tools directory with an AI-powered recommendation system**.

The platform provides detailed information about AI tools and allows users to **search, explore categories, and receive personalized tool recommendations** based on what they want to accomplish.

---

# 🚀 Features

### 🔎 AI Tool Discovery

Explore a curated collection of **100 AI tools** organized across multiple categories.

### 🧠 AI Tool Recommendation System

Not sure which AI tool to use?

Use the **AI-powered recommendation feature** to describe your task, and TOOLMIND will suggest the **best matching tools** using semantic similarity.

### 📚 Learn About Each Tool

Every tool includes:

* Description
* Category
* Key use cases
* Official website link

### 🔍 Smart Search

Quickly find tools by searching keywords related to your task or tool functionality.

### 📂 Category-Based Browsing

Tools are organized into structured categories to make discovery easier.

### 🌐 Modern Web Interface

A responsive website designed to provide a **clean and intuitive user experience**.

---

# 🧰 AI Tool Categories

TOOLMIND currently includes **100 AI tools** distributed across the following categories:

* 🎨 Image Generation AI
* 🎬 Video Generation AI
* 🗣 Voice / Audio AI
* 💻 Coding AI Tools
* 🔍 Research AI Tools
* ✍️ Writing AI Tools
* 📊 Productivity AI
* 🤖 Automation AI
* 📈 Marketing AI
* 🎓 Education / Learning AI

---

# 🧠 AI Recommendation Engine

TOOLMIND includes a **machine learning based recommendation system**.

### How it Works

1. The user enters a task description.

Example:

```text
"I want AI to generate images from text prompts"
```

2. The system converts the query into **vector embeddings** using a language model.

3. The query is compared with embeddings of all AI tools.

4. The system returns the **most relevant tools**.

This allows users to discover tools based on **intent rather than exact keywords**.

---

# 🏗 Project Architecture

```text
User Query
     ↓
Frontend Website
     ↓
Flask API (Backend)
     ↓
ML Recommendation Model (model.pkl)
     ↓
Top AI Tools Returned
```

---

# 📁 Project Structure

```
toolmind/

backend/
│
├── app.py
├── model.pkl
├── requirements.txt

frontend/
│
├── index.html
├── tool.html
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── recommend.js
│   ├── search.js
│   └── toolpage.js

data/
│
└── tools.json
```

---

# ⚙️ Running the Project Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/toolmind.git
cd toolmind
```

### 2️⃣ Install Backend Dependencies

```bash
pip install -r backend/requirements.txt
```

### 3️⃣ Run the App

From the project root:

```bash
python backend/app.py
```

Or use the run script: `./run.sh` (or `bash run.sh`).

### 4️⃣ Open the Website

**Important:** Open the app in your browser at:

```
http://127.0.0.1:5000
```

Do **not** open `frontend/index.html` directly (file://). The Flask server serves the frontend and the API; tool READMEs and the Compare feature only work when you use **http://127.0.0.1:5000**.

---

# 🌐 Deployment

You can deploy TOOLMIND as a **single app** (Flask serves both the website and the API).

### Option 1: Deploy on Render (recommended)

1. Push your code to **GitHub** (ensure `AI-TOOLS - Sheet1.csv`, `100-AI-TOOLS/`, `frontend/`, and `backend/` are committed).
2. Go to [render.com](https://render.com) and sign in.
3. Click **New** → **Web Service** and connect your GitHub repo.
4. Use these settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn backend.app:app --bind 0.0.0.0:$PORT`
   - **Environment:** Leave default (Render sets `PORT`).
5. Click **Create Web Service**. After the build, your site will be live at `https://<your-service>.onrender.com`.

**Or** use the Blueprint: in the repo root, use the **Blueprint** option and select `render.yaml` for one-click setup.

### Option 2: Deploy with Docker

```bash
docker build -t toolmind-ai .
docker run -p 5000:5000 -e PORT=5000 toolmind-ai
```

Then expose port 5000 via your host or cloud (e.g. Railway, Fly.io, AWS).

### After deployment

- Open the app at the URL provided (e.g. `https://your-app.onrender.com`).
- README details, Compare table, and recommendations all work from the same URL; no extra frontend deploy needed.

---

# 🎯 Purpose of the Project

TOOLMIND was built to:

* Simplify the process of **discovering AI tools**
* Help users **find the best tool for their task**
* Provide a **learning platform for modern AI tools**
* Demonstrate a **real-world AI-powered recommendation system**

---

# 👨‍💻 Author

**Billa Sahithi**

---

# ⭐ Support

If you found this project useful:

⭐ Star the repository
🔗 Share the project
💡 Suggest new AI tools

---

# 🔮 Future Improvements

Potential upgrades for TOOLMIND include:

* Trending AI tools
* User ratings and reviews
* Tool comparison system
* More advanced recommendation models
* Automatic dataset updates

---


