const state = {
  products: [],
  remoteProducts: [],
  category: "전체",
  query: "",
  sort: "latest",
  visibleCount: 6,
  remoteLoading: false,
  remoteMessage: ""
};

const PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 420;

const grid = document.querySelector("#productGrid");
const template = document.querySelector("#productTemplate");
const resultCount = document.querySelector("#resultCount");
const searchInput = document.querySelector("#search");
const searchStatus = document.querySelector("#searchStatus");
const categoryTabs = document.querySelector("#categoryTabs");
const sortSelect = document.querySelector("#sort");
const loadMoreButton = document.querySelector("#loadMore");
let searchTimer = 0;
let searchAbortController = null;

function parseNumber(value = "") {
  const number = String(value).replace(/[^\d]/g, "");
  return number ? Number(number) : 0;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || "";
}

function setLink(selector, url, label) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.href = url || "#";
  if (label) element.setAttribute("aria-label", label);
}

function renderHighlightedText(element, text, terms = []) {
  const safeText = text || "";
  element.textContent = "";

  const highlightTerms = [...terms].filter(Boolean).sort((a, b) => b.length - a.length);
  if (highlightTerms.length === 0) {
    element.textContent = safeText;
    return;
  }

  let cursor = 0;
  while (cursor < safeText.length) {
    let nextIndex = -1;
    let nextTerm = "";

    highlightTerms.forEach((term) => {
      const index = safeText.indexOf(term, cursor);
      if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
        nextIndex = index;
        nextTerm = term;
      }
    });

    if (nextIndex === -1) {
      element.append(document.createTextNode(safeText.slice(cursor)));
      break;
    }

    if (nextIndex > cursor) {
      element.append(document.createTextNode(safeText.slice(cursor, nextIndex)));
    }

    const highlight = document.createElement("span");
    highlight.className = "summary-highlight";
    highlight.textContent = nextTerm;
    element.append(highlight);
    cursor = nextIndex + nextTerm.length;
  }
}

function renderHero(product) {
  if (!product) return;

  const heroSummary = document.querySelector("#heroSummary");

  setText("#heroName", product.name);
  setText("#heroOriginalPrice", product.originalPrice);
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

function updateSearchStatus(message = "", tone = "") {
  if (!searchStatus) return;
  searchStatus.textContent = message;
  searchStatus.hidden = !message;
  searchStatus.dataset.tone = tone;
}

function renderCategories() {
  if (!categoryTabs) return;

  const categoryProducts = [...state.products, ...state.remoteProducts];
  const categories = ["전체", ...new Set(categoryProducts.map((product) => product.category).filter(Boolean))];
  categoryTabs.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category-tab";
    button.type = "button";
    button.dataset.category = category;
    button.textContent = category;
    button.classList.toggle("is-active", state.category === category);
    button.addEventListener("click", () => {
      state.category = category;
      state.visibleCount = PAGE_SIZE;
      renderProducts();
    });
    categoryTabs.append(button);
  });
}

function matchesProduct(product) {
  const benefits = Array.isArray(product.benefits) ? product.benefits.join(" ") : "";
  const haystack = `${product.name} ${product.category} ${product.badge} ${product.summary} ${benefits}`.toLowerCase();
  const matchesCategory = state.category === "전체" || product.category === state.category;
  const matchesQuery = !state.query || haystack.includes(state.query.toLowerCase());
  return matchesCategory && matchesQuery;
}

function getProductOrder(product) {
  if (product.source === "api") return -state.remoteProducts.indexOf(product) - 1;
  return state.products.indexOf(product);
}

function sortProducts(products) {
  return [...products].sort((a, b) => {
    if (state.sort === "price-low") return parseNumber(a.price) - parseNumber(b.price);
    if (state.sort === "discount-high") return parseNumber(b.discount) - parseNumber(a.discount);
    if (state.sort === "review-high") return parseNumber(b.review) - parseNumber(a.review);
    return getProductOrder(b) - getProductOrder(a);
  });
}

function createProductCard(product) {
  const card = template.content.firstElementChild.cloneNode(true);
  const media = card.querySelector(".product-media");
  const photo = card.querySelector(".product-photo");
  const badge = card.querySelector(".product-badge");
  const category = card.querySelector(".product-category");
  const review = card.querySelector(".product-review");
  const title = card.querySelector("h3");
  const summary = card.querySelector(".product-summary");
  const benefitList = card.querySelector(".benefit-list");
  const originalPriceValue = card.querySelector(".card-original-price-value");
  const discountLabel = card.querySelector(".card-discount-label");
  const discountValue = card.querySelector(".card-discount-value");
  const salePriceValue = card.querySelector(".card-sale-price-value");
  const reviewLabel = card.querySelector(".card-review-label");
  const reviewValue = card.querySelector(".card-review-value");
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
  originalPriceValue.textContent = product.originalPrice;
  discountLabel.textContent = "할인율";
  discountValue.textContent = product.discount;
  salePriceValue.textContent = product.price;
  reviewLabel.textContent = "상품평";
  reviewValue.textContent = product.review.replace(" 상품평", "");
  buyLink.href = product.productUrl;
  buyLink.setAttribute("aria-label", `${product.name} 쿠팡에서 보기`);

  (product.benefits || []).forEach((benefit) => {
    const item = document.createElement("li");
    item.textContent = benefit;
    benefitList.append(item);
  });

  return card;
}

function renderProducts() {
  const featuredProduct = state.products[0];
  const featuredProductId = featuredProduct?.id;
  const localProducts = state.products
    .filter((product) => product.id !== featuredProductId)
    .filter(matchesProduct);
  const remoteProducts = state.query.length >= 2
    ? state.remoteProducts.filter((product) => state.category === "전체" || product.category === state.category)
    : [];
  const filteredProducts = [...localProducts, ...remoteProducts];
  const sortedProducts = sortProducts(filteredProducts);
  const visibleProducts = sortedProducts.slice(0, state.visibleCount);

  grid.innerHTML = "";
  resultCount.textContent = `${filteredProducts.length}개`;
  renderCategories();

  if (visibleProducts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.remoteLoading ? "쿠팡 상품을 검색 중입니다." : "조건에 맞는 상품이 없습니다.";
    grid.append(empty);
  } else {
    visibleProducts.forEach((product) => grid.append(createProductCard(product)));
  }

  if (loadMoreButton) {
    const hasMore = state.visibleCount < sortedProducts.length;
    loadMoreButton.hidden = !hasMore;
    loadMoreButton.textContent = `더보기 (${Math.min(PAGE_SIZE, sortedProducts.length - state.visibleCount)}개)`;
  }
}

function normalizeRemoteProduct(product, index, query) {
  return {
    ...product,
    id: `api-${query}-${index}-${product.id || "product"}`,
    source: "api",
    badge: product.badge || "쿠팡 검색",
    review: product.review || "쿠팡 확인",
    originalPrice: product.originalPrice || "쿠팡 확인",
    discount: product.discount || "쿠팡 확인",
    benefits: product.benefits || ["쿠팡 API 검색 결과", "상품 이미지와 가격 자동 확인", "쿠팡 상품 페이지에서 조건 최종 확인"]
  };
}

async function searchRemoteProducts(query) {
  if (searchAbortController) searchAbortController.abort();
  searchAbortController = new AbortController();
  const currentController = searchAbortController;

  state.remoteLoading = true;
  state.remoteMessage = "쿠팡 검색 중";
  updateSearchStatus(state.remoteMessage, "loading");
  renderProducts();

  try {
    const params = new URLSearchParams({
      action: "public-search",
      keyword: query,
      limit: "10"
    });
    const response = await fetch(`/api/coupang?${params}`, {
      signal: currentController.signal
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "remote search failed");
    }

    if (state.query !== query) return;

    state.remoteProducts = (payload.normalizedProducts || []).map((product, index) =>
      normalizeRemoteProduct(product, index, query)
    );
    state.remoteMessage = state.remoteProducts.length
      ? `쿠팡 검색 결과 ${state.remoteProducts.length}개`
      : "쿠팡 검색 결과가 없습니다.";
    updateSearchStatus(state.remoteMessage, state.remoteProducts.length ? "success" : "empty");
  } catch (error) {
    if (error.name === "AbortError") return;
    state.remoteProducts = [];
    state.remoteMessage = "쿠팡 검색 결과를 불러오지 못했습니다.";
    updateSearchStatus(state.remoteMessage, "error");
  } finally {
    if (currentController === searchAbortController) {
      state.remoteLoading = false;
      renderCategories();
      renderProducts();
    }
  }
}

function scheduleRemoteSearch() {
  clearTimeout(searchTimer);
  if (searchAbortController) searchAbortController.abort();

  const query = state.query;
  state.remoteProducts = [];
  state.remoteLoading = false;

  if (query.length < 2) {
    updateSearchStatus("");
    renderProducts();
    return;
  }

  state.remoteLoading = true;
  updateSearchStatus("쿠팡 검색 준비 중", "loading");
  renderProducts();
  searchTimer = setTimeout(() => searchRemoteProducts(query), SEARCH_DEBOUNCE_MS);
}

async function loadProducts() {
  try {
    const response = await fetch(`./products.json?v=${Date.now()}`);
    if (!response.ok) throw new Error("products.json load failed");
    state.products = await response.json();
    renderHero(state.products[0]);
    renderCategories();
    renderProducts();
  } catch (error) {
    grid.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "상품 데이터를 불러오지 못했습니다.";
    grid.append(empty);
  }
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  state.category = "전체";
  state.visibleCount = PAGE_SIZE;
  renderProducts();
  scheduleRemoteSearch();
});

if (sortSelect) {
  sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    state.visibleCount = PAGE_SIZE;
    renderProducts();
  });
}

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderProducts();
  });
}

loadProducts();
