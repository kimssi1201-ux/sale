const state = {
  products: [],
  remoteProducts: [],
  categoryShowcaseProducts: [],
  category: "전체",
  query: "",
  sort: "latest",
  visibleCount: 15,
  remoteLoading: false,
  remoteMessage: ""
};

const PAGE_SIZE = 15;
const SEARCH_FETCH_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 420;
const ALL_CATEGORY = "전체";
const FIXED_PICK_IDS = [
  "june-dehumidifier",
  "june-moisture-absorber",
  "june-circulator",
  "june-cooling-pad",
  "june-portable-fan",
  "june-sunscreen",
  "june-uv-umbrella",
  "june-car-sunshade",
  "june-summer-blanket",
  "june-mosquito-repeller",
  "june-ice-box",
  "june-cooler-bag",
  "june-rain-boots",
  "june-raincoat",
  "june-cooling-sleeves",
  "june-aqua-shoes",
  "june-stand-fan",
  "june-aircon-filter",
  "june-pool-tube",
  "june-camping-tarp"
];

const HOME_RECOMMENDATION_GROUPS = [
  { keyword: "제습기", category: "장마·습기", badge: "장마대비" },
  { keyword: "제습제", category: "장마·습기", badge: "습기관리" },
  { keyword: "선풍기", category: "여름가전", badge: "더위대비" },
  { keyword: "써큘레이터", category: "여름가전", badge: "냉방보조" },
  { keyword: "냉감패드", category: "여름침구", badge: "열대야대비" },
  { keyword: "쿨매트", category: "여름침구", badge: "수면준비" },
  { keyword: "아쿠아슈즈", category: "물놀이", badge: "물놀이" },
  { keyword: "물놀이 튜브", category: "물놀이", badge: "가족나들이" },
  { keyword: "캠핑 타프", category: "야외·캠핑", badge: "그늘막" },
  { keyword: "아이스박스", category: "야외·캠핑", badge: "보냉준비" },
  { keyword: "차량용 햇빛가리개", category: "차량관리", badge: "차량열기" },
  { keyword: "선크림", category: "자외선대비", badge: "외출필수" }
];

const CATEGORY_ORDER = [
  ALL_CATEGORY,
  "6월 추천",
  "장마·습기",
  "여름가전",
  "여름침구",
  "물놀이",
  "야외·캠핑",
  "차량관리",
  "자외선대비",
  "생활용품",
  "가전디지털",
  "홈인테리어",
  "스포츠/레저",
  "패션잡화",
  "자동차용품",
  "뷰티",
  "완구/취미"
];

const grid = document.querySelector("#productGrid");
const template = document.querySelector("#productTemplate");
const resultCount = document.querySelector("#resultCount");
const productKicker = document.querySelector("#productKicker");
const productTitle = document.querySelector("#productTitle");
const searchInput = document.querySelector("#search");
const searchStatus = document.querySelector("#searchStatus");
const fixedPicksSection = document.querySelector(".fixed-picks");
const fixedPicksGrid = document.querySelector("#fixedPicksGrid");
const categoryShowcase = document.querySelector("#categoryShowcase");
const categorySliderSections = document.querySelector("#categorySliderSections");
const categoryTabs = document.querySelector("#categoryTabs");
const sortSelect = document.querySelector("#sort");
const loadMoreButton = document.querySelector("#loadMore");
const contentLayout = document.querySelector(".content-layout");

let searchTimer = 0;
let searchAbortController = null;

function parseNumber(value = "") {
  const number = String(value).replace(/[^\d]/g, "");
  return number ? Number(number) : 0;
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function isSearchMode() {
  return state.query.length > 0;
}

function setSearchMode() {
  const active = isSearchMode();
  document.body.classList.toggle("is-search-mode", active);
  if (fixedPicksSection) fixedPicksSection.hidden = active;
  if (categoryShowcase) categoryShowcase.hidden = active;
  if (contentLayout) contentLayout.hidden = !active;
}

function getFixedProducts() {
  const productsById = new Map(state.products.map((product) => [product.id, product]));
  return FIXED_PICK_IDS.map((id) => productsById.get(id)).filter(Boolean);
}

function getCategoryRank(category) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function sortCategoryNames(categories) {
  return [...categories].sort((left, right) => {
    const rankDiff = getCategoryRank(left) - getCategoryRank(right);
    if (rankDiff !== 0) return rankDiff;
    return left.localeCompare(right, "ko");
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

function highlightedText(text = "", words = []) {
  const fragment = document.createDocumentFragment();
  const safeText = String(text);
  const highlights = words.filter(Boolean).sort((a, b) => b.length - a.length);

  if (highlights.length === 0) {
    fragment.append(safeText);
    return fragment;
  }

  const pattern = new RegExp("(" + highlights.map(escapeRegExp).join("|") + ")", "gi");
  safeText.split(pattern).forEach((part) => {
    if (!part) return;
    const matched = highlights.some((word) => word.toLowerCase() === part.toLowerCase());
    if (matched) {
      const mark = document.createElement("mark");
      mark.textContent = part;
      fragment.append(mark);
    } else {
      fragment.append(part);
    }
  });

  return fragment;
}

function updateSearchStatus(message = "", tone = "") {
  if (!searchStatus) return;
  searchStatus.textContent = message;
  searchStatus.hidden = !message;
  searchStatus.dataset.tone = tone;
}

function scrollSliderTrack(track, direction) {
  if (!track) return;
  const maxScroll = Math.max(track.scrollWidth - track.clientWidth, 0);
  if (maxScroll === 0) return;

  const distance = Math.max(Math.round(track.clientWidth * 0.88), 280);
  const nextLeft = Math.min(Math.max(track.scrollLeft + direction * distance, 0), maxScroll);
  track.scrollLeft = nextLeft;
}

function createSlideControls(track, label) {
  const controls = document.createElement("div");
  controls.className = "slide-controls";

  [
    { direction: -1, text: "<", label: `${label} 이전 상품` },
    { direction: 1, text: ">", label: `${label} 다음 상품` }
  ].forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slide-button";
    button.textContent = item.text;
    button.setAttribute("aria-label", item.label);
    button.addEventListener("click", () => scrollSliderTrack(track, item.direction));
    controls.append(button);
  });

  return controls;
}

function createFixedPickCard(product) {
  const card = document.createElement("a");
  card.className = "fixed-pick-card";
  card.href = product.link || "#";
  card.target = "_blank";
  card.rel = "nofollow sponsored noopener";

  const imageBox = document.createElement("span");
  imageBox.className = "fixed-pick-image";

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.title;
  image.loading = "lazy";
  imageBox.append(image);

  const copy = document.createElement("span");
  copy.className = "fixed-pick-copy";
  copy.append(
    createTextElement("span", "fixed-pick-badge", product.category || "추천"),
    createTextElement("strong", "", product.title),
    createTextElement("span", "fixed-pick-price", product.price || "쿠팡에서 확인")
  );

  card.append(imageBox, copy);
  return card;
}

function renderFixedPicks() {
  if (!fixedPicksGrid) return;
  fixedPicksGrid.innerHTML = "";
  getFixedProducts().forEach((product) => fixedPicksGrid.append(createFixedPickCard(product)));

  const head = document.querySelector(".fixed-picks-head");
  if (head) {
    head.querySelector(".slide-controls")?.remove();
    head.append(createSlideControls(fixedPicksGrid, "6월 추천제품"));
  }
}

function createCategorySlideCard(product) {
  const card = document.createElement("a");
  card.className = "category-slide-card";
  card.href = product.link || "#";
  card.target = "_blank";
  card.rel = "nofollow sponsored noopener";

  const imageBox = document.createElement("span");
  imageBox.className = "category-slide-image";
  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.title;
  image.loading = "lazy";
  imageBox.append(image);

  const badge = createTextElement("span", "category-slide-badge", product.category || "추천");
  const title = createTextElement("strong", "category-slide-title", product.title);
  const price = createTextElement("span", "category-slide-price", product.price || "쿠팡에서 확인");
  const action = createTextElement("span", "category-slide-action", "쿠팡에서 보기");

  card.append(imageBox, badge, title, price, action);
  return card;
}

function renderCategoryShowcase() {
  if (!categorySliderSections) return;

  const sourceProducts = state.categoryShowcaseProducts.length
    ? state.categoryShowcaseProducts
    : getFixedProducts();
  const grouped = sourceProducts.reduce((map, product) => {
    const category = product.category || "추천";
    if (!map.has(category)) map.set(category, []);
    map.get(category).push(product);
    return map;
  }, new Map());

  categorySliderSections.innerHTML = "";
  sortCategoryNames(grouped.keys()).forEach((category) => {
    const products = grouped.get(category);
    if (!products || products.length === 0) return;

    const rail = document.createElement("section");
    rail.className = "category-rail";
    rail.dataset.category = category;

    const track = document.createElement("div");
    track.className = "category-rail-track";
    products.forEach((product) => track.append(createCategorySlideCard(product)));

    const head = document.createElement("div");
    head.className = "category-rail-head";
    const titleWrap = document.createElement("div");
    titleWrap.append(
      createTextElement("span", "", "카테고리"),
      createTextElement("strong", "", category)
    );
    const meta = document.createElement("div");
    meta.className = "category-rail-meta";
    meta.append(createTextElement("em", "", `${products.length}개`), createSlideControls(track, category));
    head.append(titleWrap, meta);

    rail.append(head, track);
    categorySliderSections.append(rail);
  });
}

function getCurrentCategoryProducts() {
  return isSearchMode() ? state.remoteProducts : state.products;
}

function renderCategories() {
  if (!categoryTabs) return;

  const categoryProducts = getCurrentCategoryProducts();
  const categories = new Set(categoryProducts.map((product) => product.category).filter(Boolean));
  const orderedCategories = [ALL_CATEGORY, ...sortCategoryNames(categories).filter((category) => category !== ALL_CATEGORY)];

  categoryTabs.innerHTML = "";
  orderedCategories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-tab${state.category === category ? " is-active" : ""}`;
    button.dataset.category = category;
    button.textContent = category;
    button.addEventListener("click", () => {
      state.category = category;
      state.visibleCount = PAGE_SIZE;
      renderProducts();
    });
    categoryTabs.append(button);
  });
}

function sortProducts(products) {
  return [...products].sort((a, b) => {
    if (state.sort === "price-low") return parseNumber(a.price) - parseNumber(b.price);
    if (state.sort === "discount-high") return parseNumber(b.discount) - parseNumber(a.discount);
    if (state.sort === "review-high") return parseNumber(b.reviews) - parseNumber(a.reviews);
    return 0;
  });
}

function updateProductHeading(total) {
  if (!productKicker || !productTitle) return;

  if (!isSearchMode()) {
    productKicker.textContent = "검색 결과";
    productTitle.textContent = "상품을 검색해보세요";
    return;
  }

  productKicker.textContent = "쿠팡 검색 결과";
  if (state.query.length < 2) {
    productTitle.textContent = "검색어를 조금 더 입력해주세요";
    return;
  }

  productTitle.textContent = total > 0 ? `"${state.query}" 검색 결과` : `"${state.query}" 검색 결과가 없습니다`;
}

function fillPriceBoard(card, product) {
  const originalPriceValue = card.querySelector(".card-original-price-value");
  const discountLabel = card.querySelector(".card-discount-label");
  const discountValue = card.querySelector(".card-discount-value");
  const salePriceValue = card.querySelector(".card-sale-price-value");
  const reviewLabel = card.querySelector(".card-review-label");
  const reviewValue = card.querySelector(".card-review-value");

  originalPriceValue.textContent = product.originalPrice || "쿠팡 확인";
  discountLabel.textContent = product.discount ? "할인율" : "가격";
  discountValue.textContent = product.discount || "쿠팡 확인";
  salePriceValue.textContent = product.price || "쿠팡 확인";
  reviewLabel.textContent = "상품평";
  reviewValue.textContent = product.reviews || "쿠팡 확인";
}

function createProductCard(product) {
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".product-card");
  const media = node.querySelector(".product-media");
  const image = node.querySelector(".product-photo");
  const badge = node.querySelector(".product-badge");
  const category = node.querySelector(".product-category");
  const review = node.querySelector(".product-review");
  const title = node.querySelector("h3");
  const summary = node.querySelector(".product-summary");
  const benefits = node.querySelector(".benefit-list");
  const link = node.querySelector(".buy-link");
  const words = product.keywords || [];

  if (card) card.dataset.productId = product.id || "";
  media.href = product.link || "#";
  link.href = product.link || "#";
  image.src = product.image;
  image.alt = product.title;
  badge.textContent = product.badge || product.category || "추천";
  category.textContent = product.category || "추천";
  review.textContent = product.reviews ? `${product.reviews} 상품평` : "쿠팡 상품";

  title.textContent = "";
  title.append(highlightedText(product.title, words));
  summary.textContent = "";
  summary.append(highlightedText(product.summary || "쿠팡 상품 페이지에서 실제 가격과 배송 조건을 확인하세요.", words));

  benefits.innerHTML = "";
  (product.benefits || []).slice(0, 3).forEach((benefit) => {
    const item = document.createElement("li");
    item.append(highlightedText(benefit, words));
    benefits.append(item);
  });

  fillPriceBoard(node, product);
  return node;
}

function renderEmpty(message, detail = "") {
  grid.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.innerHTML = `<strong>${message}</strong>${detail ? `<span>${detail}</span>` : ""}`;
  grid.append(empty);
  if (loadMoreButton) loadMoreButton.hidden = true;
}

function renderProducts() {
  if (!grid || !resultCount) return;

  setSearchMode();
  const searchMode = isSearchMode();
  const categoryProducts = searchMode
    ? state.remoteProducts.filter((product) => state.category === ALL_CATEGORY || product.category === state.category)
    : [];
  const sortedProducts = sortProducts(categoryProducts);
  const visibleProducts = sortedProducts.slice(0, state.visibleCount);

  resultCount.textContent = `${categoryProducts.length}개`;
  updateProductHeading(categoryProducts.length);
  renderCategories();

  if (!searchMode) {
    grid.innerHTML = "";
    if (loadMoreButton) loadMoreButton.hidden = true;
    return;
  }

  if (state.query.length < 2) {
    renderEmpty("검색어를 2글자 이상 입력하세요.", "입력하면 이 화면에서 검색 결과만 따로 보여드립니다.");
    return;
  }

  if (state.remoteLoading) {
    renderEmpty("쿠팡 상품을 검색 중입니다.", "잠시만 기다려주세요.");
    return;
  }

  if (visibleProducts.length === 0) {
    renderEmpty("검색 결과가 없습니다.", "다른 상품명이나 키워드로 다시 검색해보세요.");
    return;
  }

  grid.innerHTML = "";
  visibleProducts.forEach((product) => grid.append(createProductCard(product)));

  if (loadMoreButton) {
    const remaining = sortedProducts.length - state.visibleCount;
    loadMoreButton.hidden = remaining <= 0;
    loadMoreButton.textContent = `더보기 (${Math.min(PAGE_SIZE, remaining)}개)`;
  }
}

function normalizeRemoteProduct(product, index, keyword) {
  const price = product.price || product.salePrice || product.finalPrice || "";
  const reviews = product.reviews || product.review || product.reviewCount || "";
  const title = product.title || product.name || product.productName || "쿠팡 상품";
  const category = product.category || keyword || "검색 상품";
  const keywords = keyword.split(/\s+/).filter(Boolean);

  return {
    id: product.id || product.productId || `remote-${Date.now()}-${index}`,
    title,
    category,
    badge: product.badge || category,
    image: product.image || product.imageUrl || product.productImage || "",
    link: product.link || product.productUrl || "#",
    originalPrice: product.originalPrice || product.basePrice || "쿠팡 확인",
    discount: product.discount || product.discountRate || "",
    price: price ? String(price) : "쿠팡 확인",
    reviews: reviews ? String(reviews) : "쿠팡 확인",
    summary: product.summary || `${title} 상품입니다. 실제 가격과 배송 조건은 쿠팡 상품 페이지에서 확인하세요.`,
    benefits: product.benefits || [
      "쿠팡 상품 페이지에서 실시간 가격 확인",
      "배송 조건과 쿠폰 적용 여부 확인 가능",
      "관심 상품을 바로 비교하기 좋음"
    ],
    keywords
  };
}

function normalizeHomeRecommendationProduct(product, index, group) {
  const normalized = normalizeRemoteProduct(product, index, group.keyword);
  const words = group.keyword.split(/\s+/).filter(Boolean);

  return {
    ...normalized,
    id: `home-${group.keyword}-${normalized.id || index}`,
    category: group.category,
    badge: group.badge || group.category,
    summary: product.summary || `${group.category}를 미리 준비할 때 비교해보기 좋은 쿠팡 상품입니다. 실제 가격, 쿠폰, 배송 조건은 쿠팡 상품 페이지에서 확인하세요.`,
    benefits: product.benefits || [
      `${group.category} 준비용으로 비교하기 좋음`,
      "쿠팡 상품 페이지에서 실시간 가격 확인",
      "필요한 옵션을 바로 보고 구매 가능"
    ],
    keywords: [...new Set([...words, group.category])]
  };
}

async function fetchRecommendationGroup(group) {
  const params = new URLSearchParams({
    action: "public-search",
    keyword: group.keyword,
    limit: "10"
  });
  const response = await fetch(`/api/coupang?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || "recommendation search failed");
  }

  const items = payload.products || payload.normalizedProducts || [];
  return items.map((product, index) => normalizeHomeRecommendationProduct(product, index, group));
}

async function loadCategoryRecommendations() {
  if (!categorySliderSections) return;

  const products = [];
  const seen = new Set();

  for (const group of HOME_RECOMMENDATION_GROUPS) {
    try {
      const groupProducts = await fetchRecommendationGroup(group);
      groupProducts.forEach((product) => {
        const key = product.link || product.id || product.title;
        if (!key || seen.has(key)) return;
        seen.add(key);
        products.push(product);
      });

      if (products.length > 0) {
        state.categoryShowcaseProducts = products;
        renderCategoryShowcase();
      }
    } catch (error) {
      // Keep the static picks visible when a recommendation keyword fails.
    }
  }
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
      limit: String(SEARCH_FETCH_LIMIT)
    });
    const response = await fetch(`/api/coupang?${params.toString()}`, {
      signal: currentController.signal
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || "remote search failed");
    }

    if (state.query !== query) return;

    const remoteItems = payload.products || payload.normalizedProducts || [];
    state.remoteProducts = remoteItems.map((product, index) => normalizeRemoteProduct(product, index, query));
    state.remoteMessage = state.remoteProducts.length
      ? `검색 결과 ${state.remoteProducts.length}개`
      : "검색 결과가 없습니다.";
    updateSearchStatus(state.remoteMessage, state.remoteProducts.length ? "success" : "empty");
  } catch (error) {
    if (error.name === "AbortError") return;
    state.remoteProducts = [];
    state.remoteMessage = "검색 결과를 불러오지 못했습니다.";
    updateSearchStatus(state.remoteMessage, "error");
  } finally {
    if (currentController === searchAbortController) {
      state.remoteLoading = false;
      renderProducts();
    }
  }
}

function scheduleRemoteSearch() {
  clearTimeout(searchTimer);
  if (searchAbortController) searchAbortController.abort();

  const query = state.query;
  state.remoteProducts = [];
  state.visibleCount = PAGE_SIZE;

  if (query.length < 2) {
    state.remoteLoading = false;
    updateSearchStatus(query.length ? "검색어를 2글자 이상 입력하세요." : "", query.length ? "empty" : "");
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
    const response = await fetch("./products.json?v=category-slider-20260609");
    state.products = await response.json();
    renderFixedPicks();
    renderCategoryShowcase();
    renderCategories();
    renderProducts();
    loadCategoryRecommendations();
  } catch (error) {
    renderEmpty("상품 정보를 불러오지 못했습니다.", "잠시 후 다시 시도해주세요.");
  }
}

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    state.category = ALL_CATEGORY;
    state.visibleCount = PAGE_SIZE;
    renderProducts();
    scheduleRemoteSearch();
  });
}

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
