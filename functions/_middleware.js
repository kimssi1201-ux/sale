const CATEGORY_FIX_SCRIPT = `(() => {
  if (window.__pickSaleCategoryCleanup) return;
  window.__pickSaleCategoryCleanup = true;

  const order = [
    "장마·습기관리",
    "더위·냉방가전",
    "냉감·여름침구",
    "물놀이·수영",
    "캠핑·피크닉",
    "차량·여름관리",
    "햇빛·자외선",
    "우비·레인용품",
    "해충·모기대비"
  ];

  const rules = [
    ["장마·습기관리", ["제습기", "제습제", "습기", "물먹", "방습", "결로", "곰팡이"]],
    ["더위·냉방가전", ["선풍기", "써큘레이터", "서큘레이터", "순환팬", "냉풍기", "냉방", "bldc"]],
    ["냉감·여름침구", ["냉감", "쿨매트", "쿨 매트", "여름이불", "여름 이불", "차렵", "침구", "패드", "토퍼"]],
    ["물놀이·수영", ["아쿠아슈즈", "아쿠아 슈즈", "물놀이", "튜브", "수영", "워터파크", "비치", "래쉬가드", "풀장", "수경"]],
    ["캠핑·피크닉", ["캠핑", "타프", "아이스박스", "쿨러", "쿨러백", "보냉", "피크닉", "차박", "그늘막", "텐트", "아웃도어"]],
    ["차량·여름관리", ["차량", "자동차", "햇빛가리개", "썬쉐이드", "선쉐이드", "썬브렐라", "에어컨 필터", "불스원"]],
    ["우비·레인용품", ["우산", "장우산", "우비", "레인부츠", "장화", "방수", "레인코트", "비옷"]],
    ["햇빛·자외선", ["선크림", "썬크림", "선블럭", "선 블럭", "자외선", "쿨토시", "토시", "양산", "uv", "spf"]],
    ["해충·모기대비", ["모기", "해충", "벌레", "퇴치기", "살충", "방충", "홈매트"]]
  ];

  const normalize = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

  function classify(text) {
    const value = normalize(text);
    let bestCategory = "홈·생활";
    let bestScore = 0;

    rules.forEach(([category, keywords]) => {
      const score = keywords.reduce((total, keyword) => {
        const word = normalize(keyword);
        return value.includes(word) ? total + word.length : total;
      }, 0);

      if (score > bestScore) {
        bestCategory = category;
        bestScore = score;
      }
    });

    return bestCategory;
  }

  function cardTitle(card) {
    return (
      card.querySelector(".category-slide-title")?.textContent ||
      card.querySelector(".fixed-pick-copy strong")?.textContent ||
      card.querySelector("h3")?.textContent ||
      ""
    ).trim();
  }

  function makeSlideControls(track, label) {
    const controls = document.createElement("div");
    controls.className = "slide-controls";

    [
      [-1, "<", label + " 이전 상품"],
      [1, ">", label + " 다음 상품"]
    ].forEach(([direction, text, ariaLabel]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slide-button";
      button.textContent = text;
      button.setAttribute("aria-label", ariaLabel);
      button.addEventListener("click", () => {
        const distance = Math.max(Math.round(track.clientWidth * 0.88), 280);
        track.scrollBy({ left: direction * distance, behavior: "smooth" });
      });
      controls.append(button);
    });

    return controls;
  }

  function makeRail(category, cards) {
    const rail = document.createElement("section");
    rail.className = "category-rail";
    rail.dataset.category = category;

    const track = document.createElement("div");
    track.className = "category-rail-track";

    cards.forEach((card) => {
      const badge = card.querySelector(".category-slide-badge");
      if (badge) badge.textContent = category;
      track.append(card);
    });

    const head = document.createElement("div");
    head.className = "category-rail-head";

    const titleWrap = document.createElement("div");
    titleWrap.innerHTML = "<span>카테고리</span>";
    const title = document.createElement("strong");
    title.textContent = category;
    titleWrap.append(title);

    const meta = document.createElement("div");
    meta.className = "category-rail-meta";
    const count = document.createElement("em");
    count.textContent = cards.length + "개";
    meta.append(count, makeSlideControls(track, category));

    head.append(titleWrap, meta);
    rail.append(head, track);
    return rail;
  }

  function normalizeFixedCards() {
    document.querySelectorAll(".fixed-pick-card").forEach((card) => {
      const category = classify(cardTitle(card));
      const badge = card.querySelector(".fixed-pick-badge");
      if (badge) badge.textContent = category;
    });
  }

  function normalizeProductCards() {
    document.querySelectorAll(".product-card").forEach((card) => {
      const category = classify(cardTitle(card));
      const categoryLabel = card.querySelector(".product-category");
      const badge = card.querySelector(".product-badge");
      if (categoryLabel) categoryLabel.textContent = category;
      if (badge) badge.textContent = category;
    });
  }

  let lastSignature = "";
  let busy = false;

  function normalizeCategoryRails() {
    const sections = document.querySelector("#categorySliderSections");
    if (!sections || busy) return;

    const cards = [...sections.querySelectorAll(".category-slide-card")];
    if (!cards.length) return;

    const signature = cards.map((card) => card.href + "|" + cardTitle(card)).join("||");
    if (signature === lastSignature) return;
    lastSignature = signature;

    const grouped = new Map();
    cards.forEach((card) => {
      const category = classify(cardTitle(card));
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(card);
    });

    busy = true;
    sections.innerHTML = "";

    [...order, ...grouped.keys()]
      .filter((category, index, list) => list.indexOf(category) === index && grouped.has(category))
      .forEach((category) => sections.append(makeRail(category, grouped.get(category))));

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
})();`;

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const injection = `<script>${CATEGORY_FIX_SCRIPT}</script>`;
  const bodyClose = "</body>";
  const nextHtml = html.includes(bodyClose) ? html.replace(bodyClose, `${injection}${bodyClose}`) : `${html}${injection}`;
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-cache");

  return new Response(nextHtml, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
