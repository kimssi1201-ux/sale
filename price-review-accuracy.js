(function () {
  var root = document.documentElement;
  var pending = false;
  var runs = 0;
  var observer = null;

  root.setAttribute("data-price-review-accuracy-loaded", "1");
  root.setAttribute("data-verified-only-loaded", "1");

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function hasWon(value) {
    return /\d[\d,]*\s*\uc6d0/.test(clean(value));
  }

  function hasPercent(value) {
    return /\d+\s*%/.test(clean(value));
  }

  function hasReviewCount(value) {
    var text = clean(value);
    return (
      /\d/.test(text) &&
      !/\ud655\uc778/.test(text) &&
      /(\uac1c|\uac74|\uc0c1\ud488\ud3c9|\ub9ac\ubdf0|\ud3c9)/.test(text)
    );
  }

  function setText(element, text) {
    if (element && clean(element.textContent) !== text) element.textContent = text;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function cellOf(element) {
    return element ? element.closest(".card-price-board > div") || element.closest("div") : null;
  }

  function setCellVisible(element, visible) {
    var cell = cellOf(element);
    if (!cell) return 0;
    cell.hidden = !visible;
    cell.classList.toggle("is-unverified", !visible);
    return visible ? 1 : 0;
  }

  function verifiedBadge(card) {
    var badge = clean(card.querySelector(".product-badge")?.textContent);
    return /(\ub85c\ucf13|\ubb34\ub8cc\ubc30\uc1a1|\ub85c\ucf13\ubc30\uc1a1)/.test(badge) ? badge : "";
  }

  function ensureSummary(card, category, price, badge) {
    var summary = card.querySelector(".product-summary");
    if (!summary) return;

    var parts = [];
    if (category) parts.push('\uce74\ud14c\uace0\ub9ac <span class="verified-mark">' + escapeHtml(category) + "</span>");
    if (price) parts.push('\uac00\uaca9 <span class="verified-mark">' + escapeHtml(price) + "</span>");
    if (badge) parts.push('\ubc30\uc1a1 <span class="verified-mark">' + escapeHtml(badge) + "</span>");

    var next = parts.join(" \u00b7 ");
    if (summary.innerHTML !== next) summary.innerHTML = next;
  }

  function ensureFacts(card, category, price, badge) {
    var list = card.querySelector(".benefit-list");
    if (!list) return;

    var facts = [];
    if (price) facts.push("\uac00\uaca9: " + price);
    if (category) facts.push("\uce74\ud14c\uace0\ub9ac: " + category);
    if (badge) facts.push("\ubc30\uc1a1: " + badge);
    facts.push("\ucfe0\ud321 \ub9c1\ud06c");

    var key = facts.join("|");
    var current = Array.prototype.slice
      .call(list.querySelectorAll("li"))
      .map(function (item) {
        return clean(item.textContent);
      })
      .join("|");
    if (current === key) {
      list.setAttribute("data-verified-facts", key);
      return;
    }
    list.setAttribute("data-verified-facts", key);
    list.innerHTML = "";
    facts.slice(0, 4).forEach(function (fact) {
      var item = document.createElement("li");
      item.textContent = fact;
      list.appendChild(item);
    });
  }

  function normalizeCard(card) {
    var labels = card.querySelectorAll(".card-price-board > div > span");
    var board = card.querySelector(".card-price-board");
    var originalValue = card.querySelector(".card-original-price-value");
    var discountLabel = card.querySelector(".card-discount-label");
    var discountValue = card.querySelector(".card-discount-value");
    var saleValue = card.querySelector(".card-sale-price-value");
    var saleLabel = saleValue && saleValue.previousElementSibling;
    var reviewLabel = card.querySelector(".card-review-label");
    var reviewValue = card.querySelector(".card-review-value");
    var reviewChip = card.querySelector(".product-review");
    var category = clean(card.querySelector(".product-category")?.textContent);
    var price = hasWon(saleValue && saleValue.textContent) ? clean(saleValue.textContent) : "";
    var badge = verifiedBadge(card);

    setText(labels[0], "\uc815\uac00");
    setText(discountLabel, "\ud560\uc778\uc728");
    setText(saleLabel || labels[2], "\uac00\uaca9");
    setText(reviewLabel, "\uc0c1\ud488\ud3c9");

    var visibleCells = 0;
    visibleCells += setCellVisible(originalValue, hasWon(originalValue && originalValue.textContent));
    visibleCells += setCellVisible(discountValue, hasPercent(discountValue && discountValue.textContent));
    visibleCells += setCellVisible(saleValue, !!price);
    visibleCells += setCellVisible(reviewValue, hasReviewCount(reviewValue && reviewValue.textContent));

    if (board) {
      board.hidden = visibleCells === 0;
      board.style.setProperty("--verified-price-cols", String(Math.max(1, visibleCells)));
    }

    if (reviewChip) {
      var reviewText = clean(reviewChip.textContent);
      var showReview = hasReviewCount(reviewText);
      reviewChip.hidden = !showReview;
      if (showReview && !/\uc0c1\ud488\ud3c9/.test(reviewText)) {
        setText(reviewChip, reviewText + " \uc0c1\ud488\ud3c9");
      }
    }

    card.querySelector(".price-accuracy-note")?.remove();
    ensureSummary(card, category, price, badge);
    ensureFacts(card, category, price, badge);
  }

  function normalizeSort() {
    var sort = document.querySelector("#sort");
    if (!sort) return;
    Array.prototype.slice
      .call(sort.querySelectorAll('option[value="review-high"], option[value="discount-high"]'))
      .forEach(function (option) {
        option.hidden = true;
        option.disabled = true;
      });
    if (sort.value === "review-high" || sort.value === "discount-high") {
      sort.value = "latest";
      sort.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function installStyle() {
    if (document.getElementById("verified-only-style")) return;
    var style = document.createElement("style");
    style.id = "verified-only-style";
    style.textContent = [
      ".card-price-board{grid-template-columns:repeat(var(--verified-price-cols,1),minmax(0,1fr))!important;}",
      ".card-price-board [hidden],.product-review[hidden]{display:none!important;}",
      ".product-summary .verified-mark{color:#d9432d;font-weight:950;background:linear-gradient(180deg,transparent 58%,rgba(255,218,74,.58) 58%);}",
      ".benefit-list li::before{background:#0f766e!important;}"
    ].join("");
    document.head.appendChild(style);
  }

  function run() {
    pending = false;
    try {
      installStyle();
      normalizeSort();
      Array.prototype.slice.call(document.querySelectorAll(".product-card")).forEach(normalizeCard);
      runs += 1;
      root.setAttribute("data-price-review-accuracy-runs", String(runs));
      root.setAttribute("data-verified-only-runs", String(runs));
      root.removeAttribute("data-price-review-accuracy-error");
      root.removeAttribute("data-verified-only-error");
    } catch (error) {
      var message = error && error.message ? error.message : "error";
      root.setAttribute("data-price-review-accuracy-error", message);
      root.setAttribute("data-verified-only-error", message);
    }
  }

  function schedule() {
    if (pending) return;
    pending = true;
    (window.requestAnimationFrame || window.setTimeout)(run, 0);
  }

  function startObserver() {
    if (observer || !document.body || !window.MutationObserver) return;
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function start() {
    run();
    startObserver();
    var loops = 0;
    var timer = window.setInterval(function () {
      run();
      loops += 1;
      if (loops > 120) window.clearInterval(timer);
    }, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
