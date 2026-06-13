(function () {
  var root = document.documentElement;
  var observer = null;
  var searchCache = {};
  var lastSearchAt = 0;
  var isSearchComposing = false;
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

  function installSearchInputGuard() {
    var search = document.querySelector("#search");
    if (!search || search.__picknsaleInputGuardInstalled) return;
    search.__picknsaleInputGuardInstalled = true;

    search.addEventListener("compositionstart", function () {
      isSearchComposing = true;
      if (search.__picknsaleCompositionTimer) {
        window.clearTimeout(search.__picknsaleCompositionTimer);
      }
    }, true);

    search.addEventListener("compositionend", function () {
      isSearchComposing = false;
      if (search.__picknsaleCompositionTimer) {
        window.clearTimeout(search.__picknsaleCompositionTimer);
      }
      search.__picknsaleCompositionTimer = window.setTimeout(function () {
        search.dispatchEvent(new Event("input", { bubbles: true }));
      }, 30);
    }, true);

    search.addEventListener("input", function (event) {
      var inputType = event.inputType || "";
      if (isSearchComposing || event.isComposing || inputType === "insertCompositionText") {
        event.stopImmediatePropagation();
      }
    }, true);
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
    var style = document.getElementById("fixed-picks-grid-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "fixed-picks-grid-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      ".fixed-picks{overflow:visible!important}",
      ".fixed-picks-head .slide-controls,.fixed-picks .slide-controls{display:none!important}",
      ".fixed-picks-grid{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;grid-auto-flow:row!important;grid-auto-columns:auto!important;gap:12px!important;overflow:visible!important;scroll-snap-type:none!important}",
      ".fixed-pick-card{display:grid!important;grid-template-rows:auto 1fr!important;align-content:start!important;min-width:0!important;width:auto!important;min-height:236px!important;overflow:hidden!important;scroll-snap-align:unset!important}",
      ".fixed-pick-image{display:grid!important;place-items:center!important;width:100%!important;height:126px!important;min-height:126px!important;overflow:hidden!important;background:#fffdf3!important;border-radius:8px!important}",
      ".fixed-pick-image img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;padding:6px!important}",
      ".fixed-pick-copy{display:grid!important;grid-template-rows:auto 1fr auto!important;gap:5px!important;min-width:0!important;overflow:hidden!important}",
      ".fixed-pick-copy strong{display:-webkit-box!important;min-height:40px!important;overflow:hidden!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow-wrap:anywhere!important;word-break:keep-all!important}",
      ".fixed-pick-price{align-self:end!important;white-space:normal!important;overflow-wrap:anywhere!important}",
      ".product-card{overflow:hidden!important}",
      ".product-media{min-width:0!important;overflow:hidden!important}",
      ".product-photo{width:100%!important;height:100%!important;object-fit:contain!important}",
      ".product-content{min-width:0!important;overflow:hidden!important}",
      ".product-card h3,.product-summary,.benefit-list li{overflow-wrap:anywhere!important;word-break:keep-all!important}",
      "@media(max-width:980px){.fixed-picks-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}",
      "@media(max-width:720px){.fixed-picks-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.fixed-pick-card{grid-template-columns:1fr!important;min-height:214px!important;padding:8px!important;gap:8px!important}.fixed-pick-image{height:112px!important;min-height:112px!important}.fixed-pick-copy strong{font-size:14px!important;min-height:38px!important}.fixed-pick-price{font-size:16px!important}.product-card{grid-template-columns:1fr!important}.product-media{min-height:220px!important;border-right:0!important;border-bottom:1px solid #dde2da!important}.product-content{padding:16px!important}}"
    ].join("");
  }

  function tuneFixedPicks() {
    installFixedPicksGrid();
    Array.prototype.slice.call(document.querySelectorAll(".fixed-picks-head .slide-controls,.fixed-picks .slide-controls")).forEach(function (control) {
      control.remove();
    });
  }

  function installContentQualitySections() {
    var main = document.querySelector("main");
    if (!main || document.getElementById("guide")) return;

    var style = document.getElementById("adsense-ready-style");
    if (!style && document.head) {
      style = document.createElement("style");
      style.id = "adsense-ready-style";
      style.textContent = [
        ".editorial-guide,.site-footer{width:min(1180px,calc(100% - 40px));margin-inline:auto}",
        ".editorial-guide{padding:26px 0 42px}.guide-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}",
        ".guide-card{padding:18px;border:1px solid #dde2da;border-radius:8px;background:#fff}.guide-card h3{margin:0 0 10px;color:#171b22;font-size:20px;line-height:1.3}.guide-card p{margin:0;color:#3f4750;font-size:16px;line-height:1.7}",
        ".site-footer{display:grid;gap:10px;padding:28px 0 42px;border-top:1px solid #dde2da;color:#4a535d}.site-footer strong{color:#171b22;font-size:20px}.site-footer nav{display:flex;flex-wrap:wrap;gap:10px 18px;font-weight:800}.site-footer a:hover{color:#075e58}.site-footer p{margin:0;font-size:14px}",
        "@media(max-width:980px){.guide-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}",
        "@media(max-width:720px){.editorial-guide,.site-footer{width:calc(100% - 24px)}.guide-grid{grid-template-columns:1fr}.guide-card{padding:16px}}"
      ].join("");
      document.head.appendChild(style);
    }

    var guide = document.createElement("section");
    guide.className = "editorial-guide";
    guide.id = "guide";
    guide.setAttribute("aria-label", "계절 상품 구매 가이드");
    guide.innerHTML = [
      '<div class="section-head"><div><p class="kicker">구매 전 체크</p><h2>생활 준비템을 고를 때 확인할 기준</h2></div></div>',
      '<div class="guide-grid">',
      '<article class="guide-card"><h3>습기와 장마 대비</h3><p>제습기나 제습제를 볼 때는 방 크기, 물통 용량, 배수 방식, 소음 정도를 먼저 확인하는 것이 좋습니다. 원룸이나 작은 방은 보관과 이동이 쉬운 제품이 편하고, 거실처럼 넓은 공간은 제습량과 연속 배수 가능 여부가 중요합니다.</p></article>',
      '<article class="guide-card"><h3>더위와 냉방 보조</h3><p>선풍기, 서큘레이터, 냉감패드는 사용 장소가 기준입니다. 책상 위에서 쓰는 제품은 소음과 각도 조절이 중요하고, 침구류는 피부에 닿는 원단감과 세탁 편의성을 함께 보는 편이 실패를 줄입니다.</p></article>',
      '<article class="guide-card"><h3>야외활동 준비</h3><p>물놀이, 캠핑, 외출용 상품은 휴대성과 관리가 핵심입니다. 접이식 구조, 무게, 방수 여부, 사용 후 건조가 쉬운지를 확인하면 한두 번 쓰고 방치되는 일을 줄일 수 있습니다.</p></article>',
      '<article class="guide-card"><h3>가격 확인 방식</h3><p>쿠팡 상품은 가격, 쿠폰, 배송 조건이 자주 바뀝니다. 이 사이트는 확인 가능한 상품명, 이미지, 현재 표시 가격을 중심으로 정리하며, 최종 구매 전에는 쿠팡 상품 페이지에서 실제 결제 금액과 배송 조건을 다시 확인하는 것을 권장합니다.</p></article>',
      "</div>"
    ].join("");
    main.appendChild(guide);

    if (!document.querySelector(".site-footer")) {
      var footer = document.createElement("footer");
      footer.className = "site-footer";
      footer.setAttribute("aria-label", "사이트 정보");
      footer.innerHTML = '<strong>픽앤세일</strong><nav aria-label="정책 및 운영 정보"><a href="./about.html">사이트 소개</a><a href="./contact.html">문의</a><a href="./privacy.html">개인정보처리방침</a><a href="./partner-disclosure.html">제휴 및 광고 고지</a></nav><p>쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>';
      document.body.appendChild(footer);
    }
  }

  function installObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.slice.call(mutation.addedNodes || []).forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.tagName === "IMG") tuneImage(node);
          else if (node.querySelectorAll) tuneImages(node);
          installSearchInputGuard();
          tuneFixedPicks();
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function start() {
    installSearchInputGuard();
    installContentQualitySections();
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
