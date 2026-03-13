// Tool comparison: select up to 3 tools and show a side-by-side table.

(function () {
  const MAX_COMPARE = 3;
  const storageKey = "toolmind_compare_ids";
  const urlParamKey = "compare";
  const API_BASE = "http://127.0.0.1:5000";

  let selectedIds = new Set();
  let getToolById = null;
  let extrasById = {};
  let extrasFetchInFlight = null;

  function loadFromStorage() {
    // Allow share links like: index.html?compare=a,b,c#compare
    try {
      const params = new URLSearchParams(window.location.search);
      const rawCompare = params.get(urlParamKey);
      if (rawCompare) {
        const ids = rawCompare
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, MAX_COMPARE);
        if (ids.length) {
          selectedIds = new Set(ids.map(String));
          saveToStorage();
          return;
        }
      }
    } catch {
      // ignore
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        selectedIds = new Set(arr.slice(0, MAX_COMPARE).map(String));
      }
    } catch {
      // ignore
    }
  }

  function saveToStorage() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...selectedIds]));
    } catch {
      // ignore
    }
  }

  function toggleTool(id) {
    const toolId = String(id);
    if (selectedIds.has(toolId)) {
      selectedIds.delete(toolId);
      saveToStorage();
      return { ok: true, action: "removed" };
    }

    if (selectedIds.size >= MAX_COMPARE) {
      return { ok: false, action: "limit" };
    }

    selectedIds.add(toolId);
    saveToStorage();
    return { ok: true, action: "added" };
  }

  function clearAll() {
    selectedIds.clear();
    saveToStorage();
  }

  function buildShareUrl() {
    const ids = [...selectedIds];
    const url = new URL(window.location.href);
    if (ids.length) {
      url.searchParams.set(urlParamKey, ids.join(","));
      url.hash = "#compare";
    } else {
      url.searchParams.delete(urlParamKey);
    }
    return url.toString();
  }

  async function copyShareLink() {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      return { ok: true, url };
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        document.body.removeChild(ta);
        return { ok: true, url };
      } catch {
        document.body.removeChild(ta);
        return { ok: false, url };
      }
    }
  }

  function renderCompare() {
    const empty = document.getElementById("compare-empty");
    const wrapper = document.getElementById("compare-table-wrapper");
    const table = document.getElementById("compare-table");
    if (!empty || !wrapper || !table || typeof getToolById !== "function") return;

    const ids = [...selectedIds];
    if (ids.length === 0) {
      empty.hidden = false;
      wrapper.hidden = true;
      table.innerHTML = "";
      return;
    }

    empty.hidden = true;
    wrapper.hidden = false;

    const tools = ids.map((id) => getToolById(id)).filter(Boolean);

    // Pull CSV-derived extras from backend (uses/uniqueFeature/pricing)
    // and re-render once loaded.
    ensureExtrasLoaded(tools.map((t) => t.id));

    const aspects = [
      { key: "category", label: "Category", render: (t) => escapeHtml(t.category) },
      { key: "description", label: "Description", render: (t) => escapeHtml(t.description) },
      {
        key: "uses",
        label: "Uses",
        render: (t) => escapeHtml(extrasById[t.id]?.uses || ""),
      },
      {
        key: "uniqueFeature",
        label: "Unique Feature",
        render: (t) => escapeHtml(extrasById[t.id]?.uniqueFeature || ""),
      },
      {
        key: "pricing",
        label: "Free/Paid",
        render: (t) => escapeHtml(extrasById[t.id]?.pricing || ""),
      },
      {
        key: "website",
        label: "Website",
        render: (t) =>
          `<a class="compare-link" href="${escapeAttr(t.website)}" target="_blank" rel="noopener">${escapeHtml(
            t.website
          )}</a>`,
      },
      {
        key: "details",
        label: "Details Page",
        render: (t) =>
          `<a class="compare-link" href="tool.html?id=${encodeURIComponent(t.id)}">Open details</a>`,
      },
    ];

    const diffKeys = new Set(
      aspects.map((a) => a.key).filter((k) => !["website", "details"].includes(k))
    );

    function isDifferent(key) {
      if (!diffKeys.has(key)) return false;
      const values = tools.map((t) => normalizeValueForDiff(t, key));
      const nonEmpty = values.filter((v) => v !== "");
      if (nonEmpty.length <= 1) return false;
      return new Set(nonEmpty).size > 1;
    }

    table.innerHTML = `
      <div class="compare-table-scroll">
        <table class="compare-table-grid">
          <thead>
            <tr>
              <th class="compare-th-aspect">Aspect</th>
              ${tools
                .map(
                  (t) => `
                    <th class="compare-th-tool">
                      <div class="compare-th-tool-inner">
                        <div class="compare-th-title">${escapeHtml(t.name)}</div>
                        <div class="compare-th-badge">${escapeHtml(t.category)}</div>
                        <div class="compare-th-actions">
                          <button class="btn btn-accent compare-remove" data-id="${escapeAttr(
                          t.id
                        )}" type="button">Remove</button>
                        </div>
                      </div>
                    </th>
                  `
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${aspects
              .map(
                (a) => {
                  const diff = isDifferent(a.key);
                  return `
                  <tr>
                    <td class="compare-td-aspect">${escapeHtml(a.label)}</td>
                    ${tools
                      .map(
                        (t) =>
                          `<td class="compare-td-value ${
                            diff ? "compare-td-diff" : ""
                          }">${a.render(t) || "—"}</td>`
                      )
                      .join("")}
                  </tr>
                `;
                }
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    // Wire remove buttons
    table.querySelectorAll(".compare-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        selectedIds.delete(String(id));
        saveToStorage();
        renderCompare();
        updateCompareButtons();
      });
    });
  }

  function updateCompareButtons() {
    document.querySelectorAll("[data-compare-id]").forEach((el) => {
      const id = el.getAttribute("data-compare-id");
      if (!id) return;
      const active = selectedIds.has(String(id));
      el.classList.toggle("btn-accent", !active);
      el.classList.toggle("btn-primary", active);
      el.textContent = active ? "Added" : "Compare";
    });

    const tray = document.getElementById("compare-tray");
    const trayCount = document.getElementById("compare-tray-count");
    if (tray && trayCount) {
      trayCount.textContent = String(selectedIds.size);
      tray.classList.toggle("compare-tray-show", selectedIds.size > 0);
    }
  }

  function initCompareTray() {
    if (document.getElementById("compare-tray")) return;

    const tray = document.createElement("div");
    tray.id = "compare-tray";
    tray.className = "compare-tray";
    tray.innerHTML = `
      <div class="compare-tray-inner">
        <div class="compare-tray-left">
          <div class="compare-tray-title">Compare tools</div>
          <div class="compare-tray-meta"><span id="compare-tray-count">0</span> selected (max ${MAX_COMPARE})</div>
        </div>
        <div class="compare-tray-actions">
          <a class="btn btn-primary" href="#compare">Compare</a>
          <button id="compare-tray-copy" class="btn btn-accent" type="button">Copy link</button>
          <button id="compare-tray-clear" class="btn btn-ghost" type="button">Clear</button>
        </div>
      </div>
    `;
    document.body.appendChild(tray);

    const copyBtn = document.getElementById("compare-tray-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const res = await copyShareLink();
        copyBtn.textContent = res.ok ? "Copied" : "Copy failed";
        setTimeout(() => (copyBtn.textContent = "Copy link"), 900);
      });
    }

    const clearBtn = document.getElementById("compare-tray-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        clearAll();
        renderCompare();
        updateCompareButtons();
      });
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replaceAll("`", "&#096;");
  }

  function normalizeValueForDiff(tool, key) {
    const val =
      key === "uses" || key === "uniqueFeature" || key === "pricing"
        ? extrasById[tool?.id]?.[key] || ""
        : tool?.[key];
    if (typeof val === "string") return val.trim().toLowerCase();
    if (val == null) return "";
    return String(val).trim().toLowerCase();
  }

  function ensureExtrasLoaded(ids) {
    const missing = ids.filter((id) => !extrasById[id]);
    if (missing.length === 0) return;
    if (extrasFetchInFlight) return;

    const url = `${API_BASE}/tool-extra?ids=${encodeURIComponent(missing.join(","))}`;
    extrasFetchInFlight = fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((arr) => {
        if (Array.isArray(arr)) {
          const next = { ...extrasById };
          arr.forEach((item) => {
            if (!item?.id) return;
            next[String(item.id)] = {
              uses: item.uses || "",
              uniqueFeature: item.uniqueFeature || "",
              pricing: item.pricing || "",
            };
          });
          extrasById = next;
        }
      })
      .catch(() => {
        // ignore; table will show —
      })
      .finally(() => {
        extrasFetchInFlight = null;
        // Re-render to fill cells once data arrives
        renderCompare();
        updateCompareButtons();
      });
  }

  window.aiCompare = {
    loadFromStorage,
    setToolGetter(fn) {
      getToolById = fn;
    },
    toggleTool,
    clearAll,
    copyShareLink,
    renderCompare,
    updateCompareButtons,
    initCompareTray,
    getSelectedIds() {
      return [...selectedIds];
    },
  };
})();

