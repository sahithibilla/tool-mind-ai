// Shared app bootstrap: load tools, wire search & filters, handle nav and hero search.
const API_BASE = "https://tool-mind-ai-1.onrender.com";

window.addEventListener("DOMContentLoaded", () => {
  const toolsGrid = document.getElementById("tools-grid");
  const loader = document.getElementById("tools-loader");
  const emptyState = document.getElementById("tools-empty");
  const yearSpan = document.getElementById("year");
  const heroSearchInput = document.getElementById("hero-search");
  const heroSearchBtn = document.getElementById("hero-search-btn");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const compareClear = document.getElementById("compare-clear");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("nav-open");
    });
  }

  let allTools = [];
  let currentFiltered = [];
  let activeCategory = "All";

  function getToolById(id) {
    return allTools.find((t) => String(t.id) === String(id));
  }

  function renderTools(tools) {
    toolsGrid.innerHTML = "";

    if (!tools || tools.length === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    const fragment = document.createDocumentFragment();

    tools.forEach((tool, index) => {
      const card = document.createElement("article");
      card.className = "tool-card";
      card.style.animationDelay = `${index * 0.03}s`;

      const titleRow = document.createElement("div");
      titleRow.className = "tool-title-row";

      const title = document.createElement("h3");
      title.className = "tool-title";
      title.textContent = tool.name;

      const badge = document.createElement("span");
      badge.className = "tool-category";
      badge.textContent = tool.category;

      titleRow.appendChild(title);
      titleRow.appendChild(badge);

      const desc = document.createElement("p");
      desc.className = "tool-description";
      desc.textContent = tool.description;

      const actions = document.createElement("div");
      actions.className = "tool-actions";

      const detailBtn = document.createElement("a");
      detailBtn.className = "btn btn-ghost";
      detailBtn.textContent = "View Details";
      detailBtn.href = `tool.html?id=${encodeURIComponent(tool.id)}`;

      const compareBtn = document.createElement("button");
      compareBtn.type = "button";
      compareBtn.className = "btn btn-accent";
      compareBtn.textContent = "Compare";
      compareBtn.setAttribute("data-compare-id", tool.id);
      compareBtn.addEventListener("click", () => {
        if (!window.aiCompare) return;
        const res = window.aiCompare.toggleTool(tool.id);
        if (!res.ok && res.action === "limit") {
          // Lightweight feedback without intrusive alerts
          compareBtn.textContent = "Max 3";
          setTimeout(() => window.aiCompare.updateCompareButtons(), 600);
          return;
        }
        window.aiCompare.renderCompare();
        window.aiCompare.updateCompareButtons();
      });

      const visitBtn = document.createElement("a");
      visitBtn.className = "btn btn-primary";
      visitBtn.textContent = "Visit Tool";
      visitBtn.href = tool.website;
      visitBtn.target = "_blank";
      visitBtn.rel = "noopener";

      actions.appendChild(detailBtn);
      actions.appendChild(compareBtn);
      actions.appendChild(visitBtn);

      card.appendChild(titleRow);
      card.appendChild(desc);
      card.appendChild(actions);

      fragment.appendChild(card);
    });

    toolsGrid.appendChild(fragment);

    if (window.aiCompare) {
      window.aiCompare.updateCompareButtons();
    }
  }

  function applySearchAndFilters() {
    const searchValue = window.aiSearch.getSearchQuery();
    const filteredByCategory = window.aiFilters.filterByCategory(
      allTools,
      activeCategory
    );
    currentFiltered = window.aiSearch.applySearch(filteredByCategory, searchValue);
    renderTools(currentFiltered);
  }

  // Public API for search & filters modules
  window.aiApp = {
    setCategory(category) {
      activeCategory = category;
      applySearchAndFilters();
    },
    onSearchChanged() {
      applySearchAndFilters();
    },
  };

  // Fetch tools.json



fetch(`${API_BASE}/recommend?query=default`)
  .then((res) => res.json())
  .then((data) => {
    allTools = data;
    window.aiSearch.initSearchInput(applySearchAndFilters);
    window.aiFilters.initCategoryChips();
    loader.style.display = "none";
    renderTools(allTools);
  })
  .catch((err) => {
    loader.style.display = "none";
    console.error("Error loading tools:", err);
    emptyState.hidden = false;
    emptyState.textContent =
      "Failed to load tools. Please refresh the page or check the console.";
  });


  // Hero search simply focuses/updates main search input
  if (heroSearchBtn && heroSearchInput) {
    const mainSearch = document.getElementById("search-input");
    heroSearchBtn.addEventListener("click", () => {
      if (!mainSearch) return;
      mainSearch.value = heroSearchInput.value || "";
      mainSearch.dispatchEvent(new Event("input"));
      mainSearch.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
});
