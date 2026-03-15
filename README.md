# 🧠 TOOLMIND

### Learn • Compare • Find the Right AI Tool

**TOOLMIND** is an intelligent platform designed to help users **discover, learn about, compare, and choose the best AI tools** for their needs.

With the rapid growth of AI technologies, hundreds of tools are available for tasks such as image generation, coding assistance, automation, writing, and more. TOOLMIND simplifies this ecosystem by combining a **curated AI tools dataset, an AI-powered recommendation system, and a comparison feature** into a single platform.

The project also includes a **manually curated dataset of 100 AI tools**, with individual documentation for each tool.

---

# 🌐 Live Demo

🔗 **Website:**
https://tool-mind-ai-1.onrender.com

---

# 🚀 Key Features

### 🔎 AI Tool Discovery

Browse a curated collection of **100 AI tools** organized into structured categories.

Users can explore tools and learn about:

* What the tool does
* Use cases
* Key capabilities
* Official website links

---

### 🧠 AI-Powered Tool Recommendation

Not sure which AI tool to use?

TOOLMIND includes a **machine learning–based recommendation system**.

Users can describe their task and the system will suggest **the most relevant AI tools**.

Example query:

```text
"I need an AI tool to generate images from text prompts"
```

The system returns the **top matching tools instantly**.

---

### ⚖️ Tool Comparison Feature

Users can select **up to 3 tools** and compare them side-by-side.

Comparison includes aspects such as:

* Category
* Description
* Features
* Use cases
* Unique capabilities

This makes it easier to **choose the best tool for a specific task**.

---

### 🔍 Smart Search

Quickly search tools by:

* Tool name
* Keywords
* Capabilities

---

### 📂 Category-Based Browsing

Tools are organized into categories including:

* 🎨 Image Generation AI
* 🎬 Video Generation AI
* 🗣 Voice / Audio AI
* 💻 Coding AI Tools
* 🔍 Research AI Tools
* ✍️ Writing AI Tools
* 📊 Productivity AI
* 🤖 Design AI
* 📈 Marketing AI
* 🎓 Education / Learning AI

---

# 📊 AI Tools Dataset

A major part of this project involved **collecting and organizing a dataset of AI tools**.

The dataset includes **100 AI tools** with structured information such as:

* Tool Name
* Category
* Description
* Use Cases
* Unique Features
* Official Website

This dataset was used to build the **AI recommendation system and the web platform**.

---

# 📄 Tool Documentation

Each AI tool included in the dataset also has its own **dedicated README file**.

These documentation files include:

* Overview of the tool
* Core capabilities
* Key use cases
* Unique features
* Official resource links

This repository therefore serves as both:

• a **learning resource for AI tools**
• a **dataset for building AI tool platforms**

---

# 🧠 AI Recommendation Engine

The recommendation system uses **semantic embeddings** to match user queries with AI tool descriptions.

### Workflow

```
User Query
     ↓
Convert Query to Embedding
     ↓
Compare with Tool Embeddings
     ↓
Return Top Matching Tools
```

This allows the system to recommend tools based on **intent rather than exact keyword matches**.

---

# 🏗 Project Architecture

```
User Input
     ↓
Frontend Website
     ↓
Flask Backend API
     ↓
ML Recommendation Model (model.pkl)
     ↓
Top AI Tools Suggested
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
├── compare.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── search.js
│   ├── recommend.js
│   ├── compare.js
│   └── toolpage.js

data/
│
└── tools.json

tools/
│
├── image-ai/
├── video-ai/
├── coding-ai/
├── writing-ai/
├── research-ai/
└── ...
```

---

# ⚙️ Running Locally

### Clone the repository

```
git clone https://github.com/YOUR_USERNAME/toolmind.git
cd toolmind
```

### Install dependencies

```
pip install -r backend/requirements.txt
```

<<<<<<< HEAD
### 3️⃣ Run the App

From the project root:
=======
### Run backend
>>>>>>> origin/main

```
python backend/app.py
```

<<<<<<< HEAD
Or use the run script: `./run.sh` (or `bash run.sh`).

### 4️⃣ Open the Website

**Important:** Open the app in your browser at:
=======
Backend runs at:
>>>>>>> origin/main

```
http://127.0.0.1:5000
```

<<<<<<< HEAD
Do **not** open `frontend/index.html` directly (file://). The Flask server serves the frontend and the API; tool READMEs and the Compare feature only work when you use **http://127.0.0.1:5000**.
=======
### Open frontend

Open:

```
frontend/index.html
```

in your browser.
>>>>>>> origin/main

---


<<<<<<< HEAD
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
=======
# 🎯 Project Goals

This project was built to:
>>>>>>> origin/main

* Simplify the process of **discovering AI tools**
* Provide **AI-powered recommendations**
* Allow **side-by-side comparison of tools**
* Create a **curated dataset of AI tools**
* Serve as a **learning resource for modern AI technologies**

---

# 👨‍💻 Author

**Billa Sahithi**

---

# ⭐ Support

If you found this project helpful:

⭐ Star the repository
🔗 Share it with others
💡 Suggest new AI tools

---

# 🔮 Future Improvements

Planned improvements include:

* Trending AI tools section
* User ratings and reviews
* Tool bookmarking
* More advanced recommendation models
* Automatic dataset updates

---

