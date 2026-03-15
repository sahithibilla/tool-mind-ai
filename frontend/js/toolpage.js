// Tool detail page: load tool info from local tools.json, then fetch README from backend.
// When served over http(s) (e.g. Flask), use relative URL so the same server is used.
// When opened as file://, use deployed API as fallback.
var API_BASE = "";
if (typeof window !== "undefined") {
  var proto = window.location && window.location.protocol;
  if (proto === "http:" || proto === "https:") {
    API_BASE = "";  // relative: /tool-readme
  } else {
    API_BASE = "https://tool-mind-ai-1.onrender.com";
  }
}

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

        // Fetch README content from backend (after a tick so marked may be ready)
        requestAnimationFrame(function () {
          fetchToolReadme(tool.id);
        });
      })
      .catch((err) => {
        console.error(err);
        showError("Failed to load tool details. Please try again.");
      });

    function fetchToolReadme(toolId) {
      readmeError.hidden = true;
      readmeEl.hidden = true;
      var path = "tool-readme?id=" + encodeURIComponent(toolId);
      var url = API_BASE ? (API_BASE + "/" + path) : ("/" + path);

      function onSuccess(data) {
        var markdown = data.markdown || "";
        readmeLoader.style.display = "none";
        if (!markdown.trim()) {
          readmeError.hidden = false;
          readmeError.textContent = "README is empty for this tool.";
          return;
        }
        var html = (window.marked && typeof window.marked.parse === "function")
          ? window.marked.parse(markdown)
          : markdown.replace(/\n/g, "<br/>");
        readmeEl.innerHTML = html;
        readmeEl.hidden = false;
      }
      function onFail() {
        readmeLoader.style.display = "none";
        readmeError.hidden = false;
        readmeError.textContent = "Detailed README could not be loaded. Run the app with: python backend/app.py and open http://127.0.0.1:5000";
      }

      fetch(url)
        .then(function (res) {
          if (res.ok) return res.json();
          throw new Error("" + res.status);
        })
        .then(onSuccess)
        .catch(function (err) {
          var fallbackUrl = "http://127.0.0.1:5000/" + path;
          if (url === fallbackUrl) {
            onFail();
            return;
          }
          fetch(fallbackUrl)
            .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
            .then(onSuccess)
            .catch(function () { onFail(); });
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

