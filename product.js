const detailRoot = document.querySelector("#productDetail");

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

function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}

function createChip(label, muted = false) {
  return createElement("span", muted ? "chip muted" : "chip", label);
}

function getBenefits(product) {
  const benefits = Array.isArray(product.benefits) ? product.benefits.filter(Boolean) : [];
  if (benefits.length) return benefits.slice(0, 3);

  return [
    productPrice(product) !== "쿠팡 확인" ? `현재 표시 가격 ${productPrice(product)}` : "",
    product.category ? `${product.category} 상품` : "",
    "세부 조건은 쿠팡 상품 페이지에서 확인"
  ].filter(Boolean).slice(0, 3);
}

function appendPriceBoard(parent, product) {
  const board = createElement("div", "price-board");
  [
    ["정가", text(product.originalPrice, "확인 필요"), ""],
    ["할인율", text(product.discount, "확인 필요"), ""],
    ["할인가", productPrice(product), "sale-price"],
    ["상품평", productReviews(product) || "확인 필요", ""]
  ].forEach(([label, value, strongClass]) => {
    const item = document.createElement("div");
    item.append(createElement("span", "", label));
    item.append(createElement("strong", strongClass, value));
    board.append(item);
  });
  parent.append(board);
}

function createBenefitList(product) {
  const list = createElement("ul", "benefit-list");
  getBenefits(product).forEach((benefit) => list.append(createElement("li", "", benefit)));
  return list;
}

function createRelatedCard(product) {
  const card = document.createElement("a");
  card.className = "pick-card";
  card.href = `./product.html?id=${encodeURIComponent(text(product.id))}`;

  const imageWrap = createElement("span", "pick-image");
  const image = document.createElement("img");
  image.src = productImage(product);
  image.alt = productName(product);
  image.loading = "lazy";
  image.decoding = "async";
  imageWrap.append(image);

  const copy = createElement("div", "pick-copy");
  const badgeRow = createElement("div", "badge-row");
  badgeRow.append(createChip(product.badge || product.category || "추천"));
  copy.append(badgeRow);
  copy.append(createElement("h3", "", productName(product)));
  copy.append(createElement("span", "pick-price", productPrice(product)));

  card.append(imageWrap, copy, createElement("span", "pick-action", "상세 보기"));
  return card;
}

function renderMissing() {
  detailRoot.innerHTML = "";
  const empty = createElement("article", "policy-article");
  empty.append(createElement("h1", "", "상품을 찾을 수 없습니다"));
  empty.append(createElement("p", "", "주소가 잘못되었거나 추천상품 목록에서 제외된 상품입니다. 메인 화면에서 다시 확인해주세요."));
  const link = createElement("a", "detail-buy-link", "추천상품 보기");
  link.href = "./";
  empty.append(link);
  detailRoot.append(empty);
}

function renderDetail(product, products) {
  detailRoot.innerHTML = "";
  document.title = `${productName(product)} | 픽앤세일`;

  const detail = createElement("article", "detail-layout");
  const media = createElement("div", "detail-media");
  const image = document.createElement("img");
  image.src = productImage(product);
  image.alt = productName(product);
  image.loading = "eager";
  media.append(image);

  const content = createElement("div", "detail-content");
  const badges = createElement("div", "badge-row");
  badges.append(createChip(product.badge || product.category || "추천"));
  if (product.category) badges.append(createChip(product.category, true));
  content.append(badges);
  content.append(createElement("h1", "", productName(product)));
  content.append(createElement("p", "detail-summary", product.summary || "확인 가능한 상품 정보 기준으로 정리했습니다. 가격, 쿠폰, 배송 조건은 쿠팡 상품 페이지에서 다시 확인하세요."));
  appendPriceBoard(content, product);
  content.append(createBenefitList(product));

  const buy = createElement("a", "detail-buy-link", "쿠팡에서 확인");
  buy.href = productUrl(product);
  buy.target = "_blank";
  buy.rel = "nofollow sponsored noopener";
  content.append(buy);

  detail.append(media, content);
  detailRoot.append(detail);

  const summarySection = createElement("section", "article-section");
  summarySection.append(createElement("h2", "", "상품 요약"));
  summarySection.append(createElement("p", "", product.summary || `${productName(product)} 상품입니다. 확인 가능한 가격과 상품명 기준으로 정리했습니다.`));
  detailRoot.append(summarySection);

  const pointSection = createElement("section", "article-section");
  pointSection.append(createElement("h2", "", "구매 포인트"));
  pointSection.append(createBenefitList(product));
  detailRoot.append(pointSection);

  const priceSection = createElement("section", "article-section");
  priceSection.append(createElement("h2", "", "가격 확인"));
  priceSection.append(createElement("p", "", "상품 가격, 쿠폰, 배송 예정일, 무료배송 여부는 판매 페이지 상황에 따라 달라질 수 있습니다. 구매 전에는 쿠팡 상품 페이지에서 실제 결제 금액과 배송 조건을 다시 확인하세요."));
  detailRoot.append(priceSection);

  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  if (related.length) {
    const relatedSection = createElement("section", "article-section");
    relatedSection.append(createElement("h2", "", "같이 볼 상품"));
    const grid = createElement("div", "related-grid");
    related.forEach((item) => grid.append(createRelatedCard(item)));
    relatedSection.append(grid);
    detailRoot.append(relatedSection);
  }
}

async function start() {
  try {
    const response = await fetch("./products.json?v=mustview-store-20260815");
    const products = await response.json();
    const id = new URLSearchParams(window.location.search).get("id") || "";
    const product = products.find((item) => item.id === id) || products[0];
    if (!product) {
      renderMissing();
      return;
    }
    renderDetail(product, products);
  } catch {
    renderMissing();
  }
}

start();
