(() => {
  const root = document.documentElement;
  if (root.getAttribute("data-category-cleanup-loaded") === "1") return;
  root.setAttribute("data-category-cleanup-loaded", "1");

  const category = {
    rainHumidity: "\uc7a5\ub9c8\u00b7\uc2b5\uae30\uad00\ub9ac",
    coolingAppliance: "\ub354\uc704\u00b7\ub0c9\ubc29\uac00\uc804",
    coolBedding: "\ub0c9\uac10\u00b7\uc5ec\ub984\uce68\uad6c",
    waterPlay: "\ubb3c\ub180\uc774\u00b7\uc218\uc601",
    campingPicnic: "\ucea0\ud551\u00b7\ud53c\ud06c\ub2c9",
    carSummer: "\ucc28\ub7c9\u00b7\uc5ec\ub984\uad00\ub9ac",
    sunUv: "\ud587\ube5b\u00b7\uc790\uc678\uc120",
    rainGoods: "\uc6b0\ube44\u00b7\ub808\uc778\uc6a9\ud488",
    mosquito: "\ud574\ucda9\u00b7\ubaa8\uae30\ub300\ube44",
    fallback: "\uc0dd\ud65c\uc6a9\ud488"
  };

  const order = [
    category.rainHumidity,
    category.coolingAppliance,
    category.coolBedding,
    category.waterPlay,
    category.campingPicnic,
    category.carSummer,
    category.sunUv,
    category.rainGoods,
    category.mosquito
  ];

  const rules = [
    [category.rainHumidity, [
      "\uc81c\uc2b5\uae30", "\uc81c\uc2b5\uc81c", "\uc2b5\uae30", "\ubb3c\uba39", "\ubc29\uc2b5", "\uacb0\ub85c", "\uacf0\ud321\uc774"
    ]],
    [category.coolingAppliance, [
      "\uc120\ud48d\uae30", "\uc368\ud058\ub808\uc774\ud130", "\uc11c\ud058\ub808\uc774\ud130", "\uc21c\ud658\ud32c", "\ub0c9\ud48d\uae30", "\ub0c9\ubc29", "bldc"
    ]],
    [category.coolBedding, [
      "\ub0c9\uac10", "\ucfe8\ub9e4\ud2b8", "\ucfe8 \ub9e4\ud2b8", "\uc5ec\ub984\uc774\ubd88", "\uc5ec\ub984 \uc774\ubd88", "\ucc28\ub835", "\uce68\uad6c", "\ud328\ub4dc", "\ud1a0\ud37c"
    ]],
    [category.waterPlay, [
      "\uc544\ucfe0\uc544\uc288\uc988", "\uc544\ucfe0\uc544 \uc288\uc988", "\ubb3c\ub180\uc774", "\ud29c\ube0c", "\uc218\uc601", "\uc6cc\ud130\ud30c\ud06c", "\ube44\uce58", "\ub798\uc26c\uac00\ub4dc", "\ud480\uc7a5", "\uc218\uacbd"
    ]],
    [category.campingPicnic, [
      "\ucea0\ud551", "\ud0c0\ud504", "\uc544\uc774\uc2a4\ubc15\uc2a4", "\ucfe8\ub7ec", "\ucfe8\ub7ec\ubc31", "\ubcf4\ub0c9", "\ud53c\ud06c\ub2c9", "\ucc28\ubc15", "\uadf8\ub298\ub9c9", "\ud150\ud2b8", "\uc544\uc6c3\ub3c4\uc5b4"
    ]],
    [category.carSummer, [
      "\ucc28\ub7c9", "\uc790\ub3d9\ucc28", "\ud587\ube5b\uac00\ub9ac\uac1c", "\uc36c\uc250\uc774\ub4dc", "\uc120\uc250\uc774\ub4dc", "\ucee4\ubc84", "\uc5d0\uc5b4\ucee8\ud544\ud130", "\ubd88\uc2a4\uc6d0"
    ]],
    [category.sunUv, [
      "\ud587\ube5b", "\uc790\uc678\uc120", "\uc120\ud06c\ub9bc", "\uc36c\ud06c\ub9bc", "\uc120\ube14\ub85d", "\uc36c\ube14\ub85d", "\ucfe8\ud1a0\uc2dc", "\ud314\ud1a0\uc2dc", "\uc591\uc0b0", "uv", "spf"
    ]],
    [category.rainGoods, [
      "\uc6b0\ube44", "\uc6b0\uc0b0", "\uc7a5\ud654", "\ub808\uc778\ubd80\uce20", "\ubc29\uc218", "\ub808\uc778\ucf54\ud2b8", "\ube44\uc637"
    ]],
    [category.mosquito, [
      "\ud574\ucda9", "\ubaa8\uae30", "\ubc8c\ub808", "\ud1f4\uce58\uae30", "\ud1f4\uce58", "\ubc29\ucda9", "\uc0b4\ucda9", "\ub9e4\ud2b8"
    ]]
  ];

  const normalize = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

  function classify(text) {
    const value = normalize(text);
    let bestCategory = category.fallback;
    let bestScore = 0;

    rules.forEach(([name, keywords]) => {
      const score = keywords.reduce((total, keyword) => {
        const word = normalize(keyword);
        return value.includes(word) ? total + word.length : total;
      }, 0);

      if (score > bestScore) {
        bestCategory = name;
        bestScore = score;
      }
    });

    return bestCategory;
  }

  function cardText(card) {
    return [
      card.querySelector(".category-slide-title")?.textContent,
      card.querySelector(".fixed-pick-copy strong")?.textContent,
      card.querySelector(".product-title")?.textContent,
      card.querySelector("h3")?.textContent,
      card.querySelector("strong")?.textContent,
      card.querySelector("img")?.alt
    ].filter(Boolean).join(" ");
  }

  function makeSlideControls(track, label) {
    const controls = document.createElement("div");
    controls.className = "slide-controls";

    [
      [-1, "<", "previous products"],
      [1, ">", "next products"]
    ].forEach(([direction, text, ariaLabel]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slide-button";
      button.textContent = text;
      button.setAttribute("aria-label", label + " " + ariaLabel);
      button.addEventListener("click", () => {
        const distance = Math.max(Math.round(track.clientWidth * 0.88), 280);
        track.scrollBy({ left: direction * distance, behavior: "smooth" });
      });
      controls.append(button);
    });

    return controls;
  }

  function makeRail(name, cards) {
    const rail = document.createElement("section");
    rail.className = "category-rail";
    rail.dataset.category = name;

    const track = document.createElement("div");
    track.className = "category-rail-track";

    cards.forEach((card) => {
      const badge = card.querySelector(".category-slide-badge");
      if (badge) badge.textContent = name;
      track.append(card);
    });

    const head = document.createElement("div");
    head.className = "category-rail-head";

    const titleWrap = document.createElement("div");
    const label = document.createElement("span");
    label.textContent = "\uce74\ud14c\uace0\ub9ac";
    const title = document.createElement("strong");
    title.textContent = name;
    titleWrap.append(label, title);

    const meta = document.createElement("div");
    meta.className = "category-rail-meta";
    const count = document.createElement("em");
    count.textContent = cards.length + "\uac1c";
    meta.append(count, makeSlideControls(track, name));

    head.append(titleWrap, meta);
    rail.append(head, track);
    return rail;
  }

  function normalizeFixedCards() {
    document.querySelectorAll(".fixed-pick-card").forEach((card) => {
      const name = classify(cardText(card));
      const badge = card.querySelector(".fixed-pick-badge");
      if (badge) badge.textContent = name;
    });
  }

  function normalizeProductCards() {
    document.querySelectorAll(".product-card").forEach((card) => {
      const name = classify(cardText(card));
      const categoryLabel = card.querySelector(".product-category");
      const badge = card.querySelector(".product-badge");
      if (categoryLabel) categoryLabel.textContent = name;
      if (badge) badge.textContent = name;
    });
  }

  let lastSignature = "";
  let busy = false;

  function normalizeCategoryRails() {
    const sections = document.querySelector("#categorySliderSections");
    if (!sections || busy) return;

    const cards = [...sections.querySelectorAll(".category-slide-card")];
    if (!cards.length) return;

    const signature = cards.map((card) => {
      const rail = card.closest(".category-rail");
      return [rail?.dataset.category || "", card.href, cardText(card)].join("|");
    }).join("||");
    if (signature === lastSignature) return;
    lastSignature = signature;

    const grouped = new Map();
    cards.forEach((card) => {
      const name = classify(cardText(card));
      if (!grouped.has(name)) grouped.set(name, []);
      grouped.get(name).push(card);
    });

    busy = true;
    sections.innerHTML = "";

    [...order, ...grouped.keys()]
      .filter((name, index, list) => list.indexOf(name) === index && grouped.has(name))
      .forEach((name) => sections.append(makeRail(name, grouped.get(name))));

    busy = false;
  }

  function runCleanup() {
    normalizeFixedCards();
    normalizeProductCards();
    normalizeCategoryRails();
  }

  const schedule = () => window.requestAnimationFrame(runCleanup);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", schedule);
  window.addEventListener("load", schedule);
  schedule();
  window.setInterval(schedule, 1500);
})();
