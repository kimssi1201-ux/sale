const products = [
  {
    id: "philips-lint-remover",
    name: "필립스 보풀제거기 GC-026 블루",
    category: "생활가전",
    badge: "생활가전",
    review: "39,981개 상품평",
    priceLabel: "와우쿠폰할인",
    price: "9,720원",
    discount: "61%",
    productUrl: "https://www.coupang.com/vp/products/4947594003?itemId=6529631478",
    imageUrl:
      "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/590703716526441-30a6e6a6-012c-485f-ac94-65ca652f640e.jpg",
    summary:
      "옷에 생긴 보풀이 신경 쓰일 때 바로 정리하기 좋은 필립스 GC-026 보풀제거기입니다. 건전지식이라 콘센트 위치를 신경 쓰지 않아도 되고, 3중날 구조로 니트와 기본 의류 보풀을 빠르게 다듬기 좋습니다. 1개 구성, 블루 색상이며 가격과 쿠폰은 쿠팡 상품 페이지에서 최종 확인하세요.",
    highlightTerms: ["필립스 GC-026", "보풀제거기", "건전지식", "3중날", "가격과 쿠폰"],
    benefits: ["3중날로 촘촘한 보풀 정리", "건전지식이라 자리 이동이 편함", "보풀함 분리로 관리가 간단함"]
  },
  {
    id: "touch-laundry-detergent",
    name: "터치 라이트 고농축 세탁세제 라벤더 2.5L 4개",
    category: "생활용품",
    badge: "생활용품",
    review: "대용량 구성",
    priceLabel: "가격 확인",
    price: "쿠팡 페이지",
    discount: "4개 구성",
    productUrl: "https://link.coupang.com/a/eiK4wyCzls",
    imageUrl:
      "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/6481/a19cda8a3902ae9970a9b2e53df0e3ab397eccc492871845a329d9f8e166.jpg",
    summary:
      "매일 쓰는 세탁세제를 넉넉하게 준비하고 싶을 때 보기 좋은 2.5L 4개 구성입니다. 라벤더향 액체세제라 평소 세탁에 바로 쓰기 좋고, 대용량이라 자주 구매하는 번거로움을 줄일 수 있습니다. 실제 가격과 배송 조건은 쿠팡 상품 페이지에서 확인하세요.",
    highlightTerms: ["매일 쓰는 세탁세제", "2.5L 4개", "라벤더향 액체세제", "대용량", "실제 가격과 배송 조건"],
    benefits: ["2.5L 4개 대용량", "액체 타입으로 사용이 간편함", "라벤더향 생활 세제"]
  }
];

const state = {
  category: "전체",
  query: ""
};

const featuredProduct = products[0];
const featuredProductId = featuredProduct.id;
const grid = document.querySelector("#productGrid");
const template = document.querySelector("#productTemplate");
const resultCount = document.querySelector("#resultCount");
const searchInput = document.querySelector("#search");
const tabs = [...document.querySelectorAll(".category-tab")];

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setLink(selector, url, label) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.href = url;
  if (label) element.setAttribute("aria-label", label);
}

function renderHighlightedText(element, text, terms = []) {
  element.textContent = "";

  const highlightTerms = [...terms].filter(Boolean).sort((a, b) => b.length - a.length);
  if (highlightTerms.length === 0) {
    element.textContent = text;
    return;
  }

  let cursor = 0;
  while (cursor < text.length) {
    let nextIndex = -1;
    let nextTerm = "";

    highlightTerms.forEach((term) => {
      const index = text.indexOf(term, cursor);
      if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
        nextIndex = index;
        nextTerm = term;
      }
    });

    if (nextIndex === -1) {
      element.append(document.createTextNode(text.slice(cursor)));
      break;
    }

    if (nextIndex > cursor) {
      element.append(document.createTextNode(text.slice(cursor, nextIndex)));
    }

    const highlight = document.createElement("span");
    highlight.className = "summary-highlight";
    highlight.textContent = nextTerm;
    element.append(highlight);
    cursor = nextIndex + nextTerm.length;
  }
}

function renderHero(product) {
  const heroSummary = document.querySelector("#heroSummary");

  setText("#heroName", product.name);
  setText("#heroSalePrice", product.price);
  setText("#heroDiscount", product.discount);
  setText("#heroReview", product.review.replace(" 상품평", ""));
  setText("#heroMediaLabel", product.category);
  setLink("#heroBuy", product.productUrl, `${product.name} 쿠팡에서 확인`);
  setLink("#heroImageLink", product.productUrl, `${product.name} 쿠팡 페이지로 이동`);
  if (heroSummary) renderHighlightedText(heroSummary, product.summary, product.highlightTerms);

  const heroImage = document.querySelector("#heroImage");
  if (heroImage) {
    heroImage.src = product.imageUrl;
    heroImage.alt = product.name;
  }
}

function matchesProduct(product) {
  const haystack = `${product.name} ${product.category} ${product.summary} ${product.benefits.join(" ")}`.toLowerCase();
  const matchesCategory = state.category === "전체" || product.category === state.category;
  const matchesQuery = !state.query || haystack.includes(state.query.toLowerCase());
  return matchesCategory && matchesQuery;
}

function renderProducts() {
  const visibleProducts = products.filter((product) => product.id !== featuredProductId).filter(matchesProduct);
  grid.innerHTML = "";
  resultCount.textContent = `${visibleProducts.length}개`;

  if (visibleProducts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "함께 볼 상품을 추가하면 여기에 표시됩니다.";
    grid.append(empty);
    return;
  }

  visibleProducts.forEach((product) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const media = card.querySelector(".product-media");
    const photo = card.querySelector(".product-photo");
    const badge = card.querySelector(".product-badge");
    const category = card.querySelector(".product-category");
    const review = card.querySelector(".product-review");
    const title = card.querySelector("h3");
    const summary = card.querySelector(".product-summary");
    const benefitList = card.querySelector(".benefit-list");
    const priceLabel = card.querySelector(".price-label");
    const priceValue = card.querySelector(".price-value");
    const buyLink = card.querySelector(".buy-link");

    media.href = product.productUrl;
    media.setAttribute("aria-label", `${product.name} 상품 페이지로 이동`);
    photo.src = product.imageUrl;
    photo.alt = product.name;
    badge.textContent = product.badge;
    category.textContent = product.category;
    review.textContent = product.review;
    title.textContent = product.name;
    renderHighlightedText(summary, product.summary, product.highlightTerms);
    priceLabel.textContent = product.priceLabel;
    priceValue.textContent = product.price;
    buyLink.href = product.productUrl;
    buyLink.setAttribute("aria-label", `${product.name} 쿠팡에서 보기`);

    product.benefits.forEach((benefit) => {
      const item = document.createElement("li");
      item.textContent = benefit;
      benefitList.append(item);
    });

    grid.append(card);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.category = tab.dataset.category;
    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    renderProducts();
  });
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderProducts();
});

renderHero(featuredProduct);
renderProducts();