(function () {
  var root = document.documentElement;
  var observer = null;

  root.setAttribute("data-load-guard-loaded", "1");

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
    document.addEventListener("DOMContentLoaded", start, { once: true });
    installObserver();
  } else {
    start();
  }
})();
