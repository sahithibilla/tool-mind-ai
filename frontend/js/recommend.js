// Frontend for AI recommendations: calls Flask /recommend and renders cards.

(function () {
  function getApiBase() {
    // Use same host as the frontend (e.g. 0.0.0.0, localhost, LAN IP)
    // but always target the Flask backend port 5000.
    const host = window.location.hostname || "127.0.0.1";
    return `http://${host}:5000`;
  }

  window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recommend-form");
    const textarea = document.getElementById("recommend-query");
    const statusEl = document.getElementById("recommend-status");
    const resultsEl = document.getElementById("recommend-results");

    if (!form || !textarea || !statusEl || !resultsEl) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = textarea.value.trim();
      if (!query) {
        statusEl.textContent = "Please describe what you want to do.";
        statusEl.classList.add("error");
        return;
      }

      statusEl.classList.remove("error");
      statusEl.textContent = "Finding the best tools for you...";
      resultsEl.innerHTML = "";

      try {
        const API_BASE = getApiBase();
        const url = `${API_BASE}/recommend?query=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          statusEl.textContent = "No recommendations found for that description.";
          return;
        }

        statusEl.textContent = `Top ${Math.min(
          5,
          data.length
        )} recommended tools for your use case:`;
        renderRecommendations(data, resultsEl);
      } catch (err) {
        console.error(err);
        statusEl.textContent =
          "Could not fetch recommendations. Make sure the backend is running on port 5000.";
        statusEl.classList.add("error");
      }
    });
  });

  function renderRecommendations(tools, container) {
    const fragment = document.createDocumentFragment();

    tools.forEach((tool, index) => {
      const card = document.createElement("article");
      card.className = "tool-card";
      card.style.animationDelay = `${index * 0.04}s`;

      const titleRow = document.createElement("div");
      titleRow.className = "tool-title-row";

      const title = document.createElement("h3");
      title.className = "tool-title";
      title.textContent = tool.name;

      const badge = document.createElement("span");
      badge.className = "tool-category";
      badge.textContent = tool.category || "AI Tool";

      titleRow.appendChild(title);
      titleRow.appendChild(badge);

      const desc = document.createElement("p");
      desc.className = "tool-description";
      desc.textContent =
        tool.description ||
        "AI-recommended tool for your described use case.";

      const actions = document.createElement("div");
      actions.className = "tool-actions";

      const visitBtn = document.createElement("a");
      visitBtn.className = "btn btn-primary";
      visitBtn.textContent = "Visit Tool";
      visitBtn.href = tool.link || tool.website || "#";
      visitBtn.target = "_blank";
      visitBtn.rel = "noopener";

      actions.appendChild(visitBtn);

      card.appendChild(titleRow);
      card.appendChild(desc);
      card.appendChild(actions);

      fragment.appendChild(card);
    });

    container.innerHTML = "";
    container.appendChild(fragment);
  }
})();
