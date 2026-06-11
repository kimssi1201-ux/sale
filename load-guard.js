(function () {
  var root = document.documentElement;
  var observer = null;
  var searchCache = {};
  var lastSearchAt = 0;
  var SEARCH_COOLDOWN_MS = 2500;
  var SEARCH_CACHE_MS = 5 * 60 * 1000;

  root.setAttribute("data-load-guard-loaded", "1");

  function installSearchRequestGuard() {
    if (window.__picknsaleFetchGuardInstalled) return;
    if (!window.fetch) {
      window.setTimeout(installSearchRequestGuard, 100);
      return;
    }
    var nativeFetch = window.fetch.bind(window);
    window.__picknsaleFetchGuardInstalled = true;

    window.fetch = function (input, init) {
      try {
        var requestUrl = typeof input === "string" ? input : input && input.url;
        var url = new URL(requestUrl, window.location.href);
        var search = document.querySelector("#search");
        var userQuery = search && search.value ? search.value.trim() : "";
        var requestKeyword = (url.searchParams.get("keyword") || "").trim();
        var isSearchApi = url.pathname === "/api/coupang" && url.searchParams.get("action") === "public-search";

        if (isSearchApi && (userQuery.length < 2 || requestKeyword !== userQuery)) {
          return Promise.resolve(new Response(JSON.stringify({
            ok: true,
            status: 200,
            message: "automatic recommendation search skipped",
            products: [],
            normalizedProducts: []
          }), {
            status: 200,
            headers: { "content-type": "application/json; charset=utf-8" }
          }));
        }

        if (isSearchApi) {
          var cacheKey = url.pathname + "?" + url.searchParams.toString();
          var cached = searchCache[cacheKey];
          var now = Date.now();

          if (cached && now - cached.time < SEARCH_CACHE_MS) {
            return Promise.resolve(new Response(cached.body, {
              status: cached.status,
              headers: { "content-type": "application/json; charset=utf-8" }
            }));
          }

          if (now - lastSearchAt < SEARCH_COOLDOWN_MS) {
            return Promise.resolve(new Response(JSON.stringify({
              ok: false,
              status: 429,
              message: "검색 요청이 너무 빠릅니다. 잠시 후 다시 검색하세요.",
              products: [],
              normalizedProducts: []
            }), {
              status: 429,
              headers: {
                "content-type": "application/json; charset=utf-8",
                "retry-after": "3"
              }
            }));
          }

          lastSearchAt = now;
          return nativeFetch(input, init).then(function (response) {
            var clone = response.clone();
            clone.text().then(function (body) {
              if (response.ok) {
                searchCache[cacheKey] = {
                  time: Date.now(),
                  status: response.status,
                  body: body
                };
              }
            }).catch(function () {});
            return response;
          });
        }
      } catch {
        // Fall through to the original fetch.
      }
      return nativeFetch(input, init);
    };
  }

  function tuneImage(image) {
    if (!image || image.nodeType !== 1 || image.tagName !== "IMG") return;
    image.loading = "lazy";
    image.decoding = "async";
    if (!image.getAttribute("fetchpriority")) image.setAttribute("fetchpriority", "low");
  }

  function tuneImages(scope) {
    Array.prototype.slice.call((scope || document).querySelectorAll("img")).forEach(tuneImage);
  }

  function installFixedPicksGrid() {
    if (!document.head) return;
    if (document.getElementById("fixed-picks-grid-style")) return;
    var style = document.createElement("style");
    style.id = "fixed-picks-grid-style";
    style.textContent = [
      ".fixed-picks{overflow:visible!important}",
      ".fixed-picks-head .slide-controls,.fixed-picks .slide-controls{display:none!important}",
      ".fixed-picks-grid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;grid-auto-flow:row!important;grid-auto-columns:auto!important;gap:12px!important;overflow:visible!important;scroll-snap-type:none!important}",
      ".fixed-pick-card{min-width:0!important;width:auto!important;scroll-snap-align:unset!important}",
      ".fixed-pick-image img{display:block!important}",
      "@media(max-width:980px){.fixed-picks-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}",
      "@media(max-width:720px){.fixed-picks-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.fixed-pick-card{grid-template-columns:1fr!important;align-content:start!important;min-height:190px!important}.fixed-pick-image{width:100%!important;height:104px!important}}"
    ].join("");
    document.head.appendChild(style);
  }

  function tuneFixedPicks() {
    installFixedPicksGrid();
    Array.prototype.slice.call(document.querySelectorAll(".fixed-picks-head .slide-controls,.fixed-picks .slide-controls")).forEach(function (control) {
      control.remove();
    });
  }

  function installObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.slice.call(mutation.addedNodes || []).forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.tagName === "IMG") tuneImage(node);
          else if (node.querySelectorAll) tuneImages(node);
          tuneFixedPicks();
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function start() {
    tuneFixedPicks();
    installObserver();
    tuneImages(document);
    var runWhenIdle = window.requestIdleCallback || function (callback) {
      return window.setTimeout(callback, 600);
    };
    runWhenIdle(function () {
      tuneFixedPicks();
      tuneImages(document);
      root.setAttribute("data-load-guard-ran", "1");
    });
  }

  if (document.readyState === "loading") {
    installSearchRequestGuard();
    document.addEventListener("DOMContentLoaded", start, { once: true });
    installObserver();
  } else {
    installSearchRequestGuard();
    start();
  }
})();
