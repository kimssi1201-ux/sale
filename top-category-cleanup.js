(function () {
  var root = document.documentElement;
  var allCategory = "\uc804\uccb4";
  var order = [
    "\uc7a5\ub9c8\u00b7\uc2b5\uae30\uad00\ub9ac",
    "\ub354\uc704\u00b7\ub0c9\ubc29\uac00\uc804",
    "\ub0c9\uac10\u00b7\uc5ec\ub984\uce68\uad6c",
    "\ubb3c\ub180\uc774\u00b7\uc218\uc601",
    "\ucea0\ud551\u00b7\ud53c\ud06c\ub2c9",
    "\ucc28\ub7c9\u00b7\uc5ec\ub984\uad00\ub9ac",
    "\ud587\ube5b\u00b7\uc790\uc678\uc120",
    "\uc6b0\ube44\u00b7\ub808\uc778\uc6a9\ud488",
    "\ud574\ucda9\u00b7\ubaa8\uae30\ub300\ube44",
    "\uc0dd\ud65c\uc6a9\ud488"
  ];

  var selected = allCategory;
  var lastSignature = "";

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function textFrom(node, selector) {
    var element = node.querySelector(selector);
    return element ? cleanText(element.textContent) : "";
  }

  function isSearchMode() {
    return document.body.className.indexOf("is-search-mode") !== -1 || toArray(document.querySelectorAll(".product-card")).length > 0;
  }

  function addCategory(list, seen, name) {
    name = cleanText(name);
    if (!name || name === "\uce74\ud14c\uace0\ub9ac" || seen[name]) return;
    seen[name] = true;
    list.push(name);
  }

  function sortCategories(categories) {
    return categories.sort(function (left, right) {
      var leftRank = order.indexOf(left);
      var rightRank = order.indexOf(right);
      if (leftRank === -1) leftRank = order.length;
      if (rightRank === -1) rightRank = order.length;
      if (leftRank !== rightRank) return leftRank - rightRank;
      return left.localeCompare(right, "ko");
    });
  }

  function collectCategories() {
    var seen = {};
    var categories = [];
    var productCards = toArray(document.querySelectorAll(".product-card"));

    if (isSearchMode() && productCards.length) {
      for (var i = 0; i < productCards.length; i += 1) {
        addCategory(categories, seen, textFrom(productCards[i], ".product-category") || textFrom(productCards[i], ".product-badge"));
      }
      return sortCategories(categories);
    }

    var fixedCards = toArray(document.querySelectorAll(".fixed-pick-card"));
    for (var j = 0; j < fixedCards.length; j += 1) {
      addCategory(categories, seen, textFrom(fixedCards[j], ".fixed-pick-badge"));
    }

    var rails = toArray(document.querySelectorAll(".category-rail"));
    for (var k = 0; k < rails.length; k += 1) {
      addCategory(categories, seen, rails[k].getAttribute("data-category") || textFrom(rails[k], ".category-rail-head strong"));
    }

    return sortCategories(categories.length ? categories : order.slice(0, order.length - 1));
  }

  function setHidden(node, hidden) {
    node.hidden = hidden;
    node.style.display = hidden ? "none" : "";
  }

  function categoryMatches(name) {
    return selected === allCategory || cleanText(name) === selected;
  }

  function filterFixedCards() {
    var cards = toArray(document.querySelectorAll(".fixed-pick-card"));
    for (var i = 0; i < cards.length; i += 1) {
      setHidden(cards[i], !categoryMatches(textFrom(cards[i], ".fixed-pick-badge")));
    }
  }

  function filterRails() {
    var rails = toArray(document.querySelectorAll(".category-rail"));
    for (var i = 0; i < rails.length; i += 1) {
      var name = rails[i].getAttribute("data-category") || textFrom(rails[i], ".category-rail-head strong");
      setHidden(rails[i], !categoryMatches(name));
    }
  }

  function filterProductCards() {
    var cards = toArray(document.querySelectorAll(".product-card"));
    var visible = 0;

    for (var i = 0; i < cards.length; i += 1) {
      var name = textFrom(cards[i], ".product-category") || textFrom(cards[i], ".product-badge");
      var hidden = !categoryMatches(name);
      setHidden(cards[i], hidden);
      if (!hidden) visible += 1;
    }

    if (cards.length) {
      var resultCount = document.querySelector("#resultCount");
      if (resultCount) resultCount.textContent = String(visible) + "\uac1c";
    }
  }

  function applyFilter() {
    var buttons = toArray(document.querySelectorAll("#categoryTabs .category-tab"));
    for (var i = 0; i < buttons.length; i += 1) {
      var name = buttons[i].getAttribute("data-clean-category") || cleanText(buttons[i].textContent);
      if (name === selected) {
        buttons[i].className = "category-tab is-active";
      } else {
        buttons[i].className = "category-tab";
      }
    }

    filterFixedCards();
    filterRails();
    filterProductCards();
  }

  function makeButton(name) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "category-tab";
    button.setAttribute("data-category", name);
    button.setAttribute("data-clean-category", name);
    button.textContent = name;
    button.onclick = function () {
      selected = name;
      lastSignature = "";
      rebuildTabs();
    };
    return button;
  }

  function rebuildTabs() {
    var tabs = document.querySelector("#categoryTabs");
    if (!tabs) return;

    var categories = collectCategories();
    if (selected !== allCategory && categories.indexOf(selected) === -1) selected = allCategory;

    var signature = selected + "|" + categories.join("|");
    if (signature !== lastSignature || tabs.getAttribute("data-clean-tabs") !== "1") {
      tabs.innerHTML = "";
      tabs.appendChild(makeButton(allCategory));
      for (var i = 0; i < categories.length; i += 1) {
        tabs.appendChild(makeButton(categories[i]));
      }
      tabs.setAttribute("data-clean-tabs", "1");
      lastSignature = signature;
    }

    applyFilter();
  }

  var runCount = 0;
  function tick() {
    try {
      rebuildTabs();
      root.setAttribute("data-top-category-cleanup-runs", String(runCount + 1));
      root.removeAttribute("data-top-category-cleanup-error");
    } catch (error) {
      root.setAttribute("data-top-category-cleanup-error", error && error.message ? error.message : "error");
    }

    runCount += 1;
    if (runCount < 90) window.setTimeout(tick, runCount < 12 ? 350 : 1000);
  }

  window.setTimeout(tick, 50);
})();
