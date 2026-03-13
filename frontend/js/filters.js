// Category filter chip handling.

(function () {
  function initCategoryChips() {
    const chips = document.querySelectorAll(".categories .chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("chip-active"));
        chip.classList.add("chip-active");
        const category = chip.getAttribute("data-category") || "All";
        if (window.aiApp && typeof window.aiApp.setCategory === "function") {
          window.aiApp.setCategory(category);
        }
      });
    });
  }

  function filterByCategory(tools, category) {
    if (!category || category === "All") return tools;
    return tools.filter((tool) => tool.category === category);
  }

  window.aiFilters = {
    initCategoryChips,
    filterByCategory,
  };
})();
