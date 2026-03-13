// Search tools by name and description with debounced input.

(function () {
  let searchInput;
  let currentQuery = "";
  let onChangeCallback = null;
  let debounceTimer = null;

  function normalize(str) {
    return (str || "").toLowerCase();
  }

  function applySearch(tools, query) {
    const q = normalize(query);
    if (!q) return tools;

    return tools.filter((tool) => {
      const name = normalize(tool.name);
      const desc = normalize(tool.description);
      return name.includes(q) || desc.includes(q);
    });
  }

  function initSearchInput(onChange) {
    searchInput = document.getElementById("search-input");
    onChangeCallback = onChange;

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
      currentQuery = searchInput.value || "";
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (typeof onChangeCallback === "function") {
          onChangeCallback();
        }
      }, 150);
    });
  }

  function getSearchQuery() {
    return currentQuery;
  }

  window.aiSearch = {
    initSearchInput,
    applySearch,
    getSearchQuery,
  };
})();
