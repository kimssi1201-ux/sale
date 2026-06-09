(function () {
  if (window.__picknsaleSearchLimit15) return;
  window.__picknsaleSearchLimit15 = true;

  var originalFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      var rawUrl = typeof input === "string" ? input : input && input.url;
      if (rawUrl && rawUrl.indexOf("/api/coupang?") !== -1 && rawUrl.indexOf("action=public-search") !== -1) {
        var url = new URL(rawUrl, window.location.href);
        url.searchParams.set("limit", "15");
        input = typeof input === "string" ? url.pathname + url.search : new Request(url.toString(), input);
      }
    } catch (error) {
      // Keep the original request if URL rewriting is not possible.
    }
    return originalFetch.call(this, input, init);
  };

  document.documentElement.setAttribute("data-search-limit-15-loaded", "1");
})();
