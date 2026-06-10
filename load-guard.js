(function () {
  var root = document.documentElement;
  var observer = null;

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
        var isSearchApi = url.pathname === "/api/coupang" && url.searchParams.get("action") === "public-search";

        if (isSearchApi && userQuery.length < 2) {
          return Promise.resolve(new Response(JSON.stringify({
            ok: true,
            status: 200,
            message: "home recommendations skipped",
            products: [],
            normalizedProducts: []
          }), {
            status: 200,
            headers: { "content-type": "application/json; charset=utf-8" }
          }));
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

  function installObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.slice.call(mutation.addedNodes || []).forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.tagName === "IMG") tuneImage(node);
          else if (node.querySelectorAll) tuneImages(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function start() {
    installObserver();
    tuneImages(document);
    var runWhenIdle = window.requestIdleCallback || function (callback) {
      return window.setTimeout(callback, 600);
    };
    runWhenIdle(function () {
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
