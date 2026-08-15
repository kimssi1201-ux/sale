const PAGE_SIZE = 15;
const SEARCH_LIMIT = 15;
const SEARCH_DEBOUNCE_MS = 900;
const SEARCH_CACHE_MS = 5 * 60 * 1000;

const state = {
  products: [],
  query: "",
  results: [],
  visibleCount: PAGE_SIZE,
  loading: false,
  cache: new Map()
};

const els = {
  fixedGrid: document.querySelector("#fixedPicksGrid"),
  resultSection: document.querySelector("#results"),
  resultGrid: document.querySelector("#productGrid"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  resultKicker: document.querySelector("#resultKicker"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#search"),
  searchStatus: document.querySelector("#searchStatus"),
  loadMore: document.querySelector("#loadMore"),
  fixedCountFact: document.querySelector("#fixedCountFact"),
  fixedCountNav: document.querySelector("#fixedCountNav")
};

let searchTimer = 0;
let searchAbortController = null;
let composing = false;
let lastSearchAt = 0;

function text(value, fallback = "") {
  return String(value || fallback).trim();
}

function productName(product) {
  return text(product.name || product.title || product.productName, "쿠팡 상품");
}

function productImage(product) {
  return text(product.imageUrl || product.image || product.productImage);
}

function productUrl(product) {
  return text(product.productUrl || product.link || product.productURL, "#");
}

function productPrice(product) {
  return text(product.price || product.finalPrice || product.salePrice, "쿠팡 확인");
}

function productReviews(product) {
  return text(product.reviews || product.review || product.reviewCount);
}

function detailUrl(product) {
  return `./product.html?id=${encodeURIComponent(text(product.id))}`;
}

function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}

function createChip(label) {
  return createElement("span", "category-chip", label);
}

function createImage(product) {
  const wrap = createElement("a", "post-card-thumbnail image-thumbnail");
  wrap.href = text(product.id) ? detailUrl(product) : productUrl(product);
  if (!text(product.id)) {
    wrap.target = "_blank";
    wrap.rel = "nofollow sponsored noopener";
  }

  const image = document.createElement("img");
  image.src = productImage(product);
  image.alt = productName(product);
  image.loading = "lazy";
  image.decoding = "async";
  image.referrerPolicy = "no-referrer";
  image.addEventListener("error", () => {
    image.remove();
    if (!wrap.querySelector("span")) {
      wrap.append(createElement("span", "", "이미지 확인"));
      wrap.append(createElement("strong", "", "상품 자료"));
    }
  });
  wrap.append(image);
  return wrap;
}

function getBenefits(product) {
  const benefits = Array.isArray(product.benefits) ? product.benefits.filter(Boolean) : [];
  if (benefits.length) return benefits.slice(0, 3);

  return [
    productPrice(product) !== "쿠팡 확인" ? `현재 표시 가격 ${productPrice(product)}` : "",
    product.category ? `${product.category} 자료` : "",
    "세부 조건은 쿠팡 상품 페이지에서 확인"
  ].filter(Boolean).slice(0, 3);
}

function verifiedSummary(product) {
  if (product.summary) return product.summary;

  const parts = [];
  if (product.category) parts.push(`분류: ${product.category}`);
  if (productPrice(product) !== "쿠팡 확인") parts.push(`가격 표시: ${productPrice(product)}`);
  if (productReviews(product)) parts.push(`상품평: ${productReviews(product)}`);

  return parts.length
    ? `${parts.join(" · ")} 기준으로 확인된 자료입니다. 쿠폰, 배송, 옵션은 쿠팡 상품 페이지에서 다시 확인하세요.`
    : "확인 가능한 상품명과 링크 기준으로 정리한 자료입니다. 가격, 쿠폰, 배송 조건은 쿠팡 상품 페이지에서 확인하세요.";
}

function createMeta(product) {
  const meta = createElement("ul", "post-meta-list");
  [
    ["가격 표시", productPrice(product), "price"],
    ["상품평", productReviews(product) || "확인 필요", ""],
    ["분류", text(product.category, "생활상품"), ""]
  ].forEach(([label, value, className]) => {
    const item = document.createElement("li");
    item.append(createElement("span", "", label));
    item.append(createElement("strong", className, value));
    meta.append(item);
  });
  return meta;
}

function createInfoCard(product) {
  const localDetail = product.source === "fixed" && text(product.id);
  const card = createElement("article", "post-card");
  const content = createElement("div", "post-card-content");
  const meta = createElement("p", "entry-meta");
  meta.append(createChip(product.badge || product.category || "상품자료"));
  if (product.category) {
    meta.append(createElement("span", "", product.category));
  }
  content.append(meta);

  const row = createElement("div", "post-card-body");
  row.append(createImage(product));

  const copy = createElement("div", "post-card-copy");
  const title = createElement("h2", "entry-title");
  const titleLink = createElement("a", "", productName(product));
  titleLink.href = localDetail ? detailUrl(product) : productUrl(product);
  if (!localDetail) {
    titleLink.target = "_blank";
    titleLink.rel = "nofollow sponsored noopener";
  }
  title.append(titleLink);
  copy.append(title);
  copy.append(createElement("p", "entry-summary", verifiedSummary(product)));
  copy.append(createMeta(product));

  const actions = createElement("div", "post-actions");
  if (localDetail) {
    const detail = createElement("a", "read-more", "자료 보기");
    detail.href = detailUrl(product);
    actions.append(detail);
  }

  const coupang = createElement("a", localDetail ? "read-more secondary" : "read-more", localDetail ? "상품 페이지 확인" : "쿠팡에서 확인");
  coupang.href = productUrl(product);
  coupang.target = "_blank";
  coupang.rel = "nofollow sponsored noopener";
  actions.append(coupang);

  copy.append(actions);
  row.append(copy);
  content.append(row);
  card.append(content);
  return card;
}

function renderFixedProducts() {
  if (!els.fixedGrid) return;
  els.fixedGrid.innerHTML = "";
  state.products.slice(0, 30).forEach((product) => {
    els.fixedGrid.append(createInfoCard({ ...product, source: "fixed" }));
  });

  const countText = `${state.products.length}건`;
  if (els.fixedCountFact) els.fixedCountFact.textContent = countText;
  if (els.fixedCountNav) els.fixedCountNav.textContent = countText;
}

function setSearchStatus(message = "", tone = "") {
  if (!els.searchStatus) return;
  els.searchStatus.textContent = message;
  els.searchStatus.hidden = !message;
  els.searchStatus.dataset.tone = tone;
}

function setSearchMode(active) {
  document.body.classList.toggle("is-search-mode", active);
  if (els.resultSection) els.resultSection.hidden = !active;
}

function renderEmpty(message, detail = "") {
  els.resultGrid.innerHTML = "";
  const empty = createElement("div", "empty-state");
  empty.append(createElement("strong", "", message));
  if (detail) empty.append(createElement("span", "", detail));
  els.resultGrid.append(empty);
  if (els.loadMore) els.loadMore.hidden = true;
}

function renderResults() {
  if (!els.resultGrid) return;
  const searching = state.query.length > 0;
  setSearchMode(searching);
  if (!searching) return;

  const total = state.results.length;
  const visible = state.results.slice(0, state.visibleCount);

  els.resultKicker.textContent = state.loading ? "검색 중" : "검색 결과";
  els.resultTitle.textContent = state.query.length < 2
    ? "검색어를 2글자 이상 입력해주세요"
    : `"${state.query}" 자료 검색 결과`;
  els.resultSummary.textContent = total
    ? `확인 가능한 자료 ${total}건을 찾았습니다. 한 번에 ${PAGE_SIZE}건씩 보여드립니다.`
    : "확인 가능한 상품명, 가격, 카테고리를 기준으로 보여드립니다.";

  if (state.query.length < 2) {
    renderEmpty("검색어를 2글자 이상 입력하세요.", "상품명이나 브랜드명을 조금 더 구체적으로 입력해주세요.");
    return;
  }

  if (state.loading) {
    renderEmpty("자료를 찾는 중입니다.", "잠시만 기다려주세요.");
    return;
  }

  if (!visible.length) {
    renderEmpty("검색 결과가 없습니다.", "다른 상품명이나 브랜드명으로 다시 검색해보세요.");
    return;
  }

  els.resultGrid.innerHTML = "";
  visible.forEach((product) => els.resultGrid.append(createInfoCard(product)));

  if (els.loadMore) {
    const remaining = total - state.visibleCount;
    els.loadMore.hidden = remaining <= 0;
    els.loadMore.textContent = `더보기 (${Math.min(PAGE_SIZE, remaining)}건)`;
  }
}

function parseRemoteProducts(payload, query) {
  const products = payload.products || payload.normalizedProducts || [];
  return products.slice(0, SEARCH_LIMIT).map((product, index) => ({
    ...product,
    id: product.id || product.productId || `search-${Date.now()}-${index}`,
    name: product.name || product.title || product.productName,
    imageUrl: product.imageUrl || product.image || product.productImage,
    productUrl: product.productUrl || product.link,
    category: product.category || "검색상품",
    badge: product.badge || product.category || "검색자료",
    price: product.price || product.finalPrice || product.salePrice,
    reviews: product.reviews || product.review || product.reviewCount || "",
    originalPrice: product.originalPrice || "",
    discount: product.discount || "",
    summary: verifiedSummary(product),
    benefits: getBenefits(product),
    keywords: query.split(/\s+/).filter(Boolean),
    source: "remote"
  }));
}

function localSearch(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return state.products
    .filter((product) => {
      const haystack = [
        productName(product),
        product.category,
        product.badge,
        product.summary,
        ...(product.benefits || [])
      ].join(" ").toLowerCase();
      return words.every((word) => haystack.includes(word));
    })
    .slice(0, SEARCH_LIMIT)
    .map((product) => ({ ...product, source: "fixed" }));
}

async function searchProducts(query) {
  if (searchAbortController) searchAbortController.abort();
  searchAbortController = new AbortController();
  const controller = searchAbortController;
  const cacheKey = query.toLowerCase();
  const cached = state.cache.get(cacheKey);

  if (cached && Date.now() - cached.time < SEARCH_CACHE_MS) {
    state.results = cached.products;
    state.loading = false;
    setSearchStatus(`검색 결과 ${cached.products.length}건`, cached.products.length ? "success" : "");
    renderResults();
    return;
  }

  state.loading = true;
  state.results = [];
  setSearchStatus("자료를 찾고 있습니다.", "");
  renderResults();

  const elapsed = Date.now() - lastSearchAt;
  if (elapsed < 2500) {
    await new Promise((resolve) => window.setTimeout(resolve, 2500 - elapsed));
  }
  lastSearchAt = Date.now();

  try {
    const params = new URLSearchParams({
      action: "public-search",
      keyword: query,
      limit: String(SEARCH_LIMIT)
    });
    const response = await fetch(`/api/coupang?${params.toString()}`, {
      signal: controller.signal
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "search unavailable");
    }

    if (state.query !== query) return;
    const products = parseRemoteProducts(payload, query);
    state.results = products;
    state.cache.set(cacheKey, { time: Date.now(), products });
    setSearchStatus(products.length ? `검색 결과 ${products.length}건` : "검색 결과가 없습니다.", products.length ? "success" : "");
  } catch (error) {
    if (error.name === "AbortError") return;
    const fallback = localSearch(query);
    state.results = fallback;
    setSearchStatus(
      fallback.length ? "연결이 잠시 느려 등록 자료에서 먼저 찾았습니다." : "검색 결과를 불러오지 못했습니다.",
      fallback.length ? "success" : "error"
    );
  } finally {
    if (controller === searchAbortController) {
      state.loading = false;
      renderResults();
    }
  }
}

function scheduleSearch() {
  window.clearTimeout(searchTimer);
  const query = state.query;
  state.visibleCount = PAGE_SIZE;

  if (!query) {
    state.results = [];
    state.loading = false;
    setSearchStatus("");
    renderResults();
    return;
  }

  if (query.length < 2) {
    state.results = [];
    state.loading = false;
    setSearchStatus("검색어를 2글자 이상 입력하세요.");
    renderResults();
    return;
  }

  searchTimer = window.setTimeout(() => searchProducts(query), SEARCH_DEBOUNCE_MS);
  renderResults();
}

async function loadProducts() {
  try {
    const response = await fetch("./products.json?v=support-info-20260815");
    state.products = (await response.json()).map((product) => ({ ...product, source: "fixed" }));
    renderFixedProducts();
  } catch {
    if (els.fixedGrid) {
      els.fixedGrid.innerHTML = "";
      els.fixedGrid.append(createElement("div", "empty-state", "자료를 불러오지 못했습니다."));
    }
  }
}

if (els.searchForm) {
  els.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = els.searchInput.value.trim();
    scheduleSearch();
  });
}

if (els.searchInput) {
  els.searchInput.addEventListener("compositionstart", () => {
    composing = true;
    window.clearTimeout(searchTimer);
  });

  els.searchInput.addEventListener("compositionend", (event) => {
    composing = false;
    state.query = event.target.value.trim();
    scheduleSearch();
  });

  els.searchInput.addEventListener("input", (event) => {
    if (composing || event.isComposing) return;
    state.query = event.target.value.trim();
    scheduleSearch();
  });
}

if (els.loadMore) {
  els.loadMore.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderResults();
  });
}

loadProducts();
