(function () {
  var root = document.documentElement;
  var CHECK = "\ucfe0\ud321\uc5d0\uc11c \ud655\uc778";
  root.setAttribute("data-price-review-accuracy-loaded", "1");

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function hasWon(value) {
    return /\d[\d,]*\s*\uc6d0/.test(clean(value));
  }

  function hasReviewCount(value) {
    var text = clean(value);
    return /\d/.test(text) && /(\uac1c|\uac74|\uc0c1\ud488\ud3c9|\ub9ac\ubdf0|\ud3c9)/.test(text);
  }

  function setText(element, text) {
    if (element && clean(element.textContent) !== text) element.textContent = text;
  }

  function ensureNote(card) {
    var board = card.querySelector(".card-price-board");
    if (!board || card.querySelector(".price-accuracy-note")) return;
    var note = document.createElement("p");
    note.className = "price-accuracy-note";
    note.textContent = "\uac00\uaca9\uc740 \ucfe0\ud321 API \uae30\uc900\uc774\uba70, \uc0c1\ud488\ud3c9 \uc218\ub294 \ucfe0\ud321 \uc0c1\ud488 \ud398\uc774\uc9c0\uc5d0\uc11c \ud655\uc778\ub429\ub2c8\ub2e4.";
    board.insertAdjacentElement("afterend", note);
  }

  function normalizeCard(card) {
    var labels = card.querySelectorAll(".card-price-board > div > span");
    var originalValue = card.querySelector(".card-original-price-value");
    var discountLabel = card.querySelector(".card-discount-label");
    var discountValue = card.querySelector(".card-discount-value");
    var saleValue = card.querySelector(".card-sale-price-value");
    var reviewLabel = card.querySelector(".card-review-label");
    var reviewValue = card.querySelector(".card-review-value");
    var reviewChip = card.querySelector(".product-review");

    setText(labels[0], "\uc815\uac00");
    setText(discountLabel, "\ud560\uc778\uc728");
    setText(labels[2], "API \uac00\uaca9");
    setText(reviewLabel, "\uc0c1\ud488\ud3c9");

    if (originalValue && !hasWon(originalValue.textContent)) setText(originalValue, CHECK);
    if (discountValue && !/%/.test(clean(discountValue.textContent))) setText(discountValue, CHECK);
    if (saleValue && !hasWon(saleValue.textContent)) setText(saleValue, CHECK);

    if (reviewValue && !hasReviewCount(reviewValue.textContent)) setText(reviewValue, CHECK);
    if (reviewChip && !hasReviewCount(reviewChip.textContent)) setText(reviewChip, "\uc0c1\ud488\ud3c9 " + CHECK);

    ensureNote(card);
  }

  function normalizeSort() {
    var sort = document.querySelector("#sort");
    if (!sort) return;
    var option = sort.querySelector('option[value="review-high"]');
    if (!option) return;
    option.textContent = "\uc0c1\ud488\ud3c9 \ub9ce\uc740\uc21c(\ucfe0\ud321 \ud655\uc778)";
    option.disabled = true;
    if (sort.value === "review-high") {
      sort.value = "latest";
      sort.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function installStyle() {
    if (document.getElementById("price-review-accuracy-style")) return;
    var style = document.createElement("style");
    style.id = "price-review-accuracy-style";
    style.textContent = [
      ".price-accuracy-note{margin:8px 0 0;color:#6b7280;font-size:13px;font-weight:800;line-height:1.45;}",
      ".product-review{color:#5b6470;}"
    ].join("");
    document.head.appendChild(style);
  }

  var runs = 0;
  function tick() {
    try {
      installStyle();
      normalizeSort();
      Array.prototype.slice.call(document.querySelectorAll(".product-card")).forEach(normalizeCard);
      root.setAttribute("data-price-review-accuracy-runs", String(runs + 1));
      root.removeAttribute("data-price-review-accuracy-error");
    } catch (error) {
      root.setAttribute("data-price-review-accuracy-error", error && error.message ? error.message : "error");
    }
    runs += 1;
    if (runs < 180) window.setTimeout(tick, runs < 25 ? 280 : 1000);
  }

  window.setTimeout(tick, 220);
})();
