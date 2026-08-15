const detailRoot = document.querySelector("#productDetail");
const TODAY_LABEL = "2026. 8. 15.";

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
  return text(product.price || product.finalPrice || product.salePrice);
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

function createLink(className, label, href) {
  const link = createElement("a", className, label);
  link.href = href;
  return link;
}

function getBenefits(product) {
  const benefits = Array.isArray(product.benefits) ? product.benefits.filter(Boolean) : [];
  if (benefits.length) return benefits.slice(0, 3);

  return [
    productPrice(product) ? `표시 가격 ${productPrice(product)}` : "",
    product.category ? `${product.category} 분류 상품` : "",
    "세부 조건은 쿠팡 상품 페이지에서 확인"
  ].filter(Boolean).slice(0, 3);
}

function buildFactRows(product) {
  const rows = [
    ["분류", text(product.category, "생활상품")],
    ["상품명", productName(product)]
  ];

  if (text(product.originalPrice)) rows.push(["정가", text(product.originalPrice)]);
  if (text(product.discount)) rows.push(["할인율", text(product.discount)]);
  if (productPrice(product)) rows.push(["표시 가격", productPrice(product)]);
  if (productReviews(product)) rows.push(["상품평", productReviews(product)]);
  rows.push(["최종 확인", "쿠팡 상품 페이지"]);
  return rows;
}

function appendKeyFacts(parent, product) {
  const facts = createElement("aside", "key-facts");
  facts.setAttribute("aria-label", `${productName(product)} 핵심 정보`);
  facts.append(createElement("strong", "", "핵심 정보"));

  const list = createElement("dl", "");
  buildFactRows(product).forEach(([label, value]) => {
    list.append(createElement("dt", "", label));
    list.append(createElement("dd", "", value));
  });
  facts.append(list);
  parent.append(facts);
}

function appendTableOfContents(parent) {
  const details = createElement("details", "table-of-contents");
  details.open = true;
  details.append(createElement("summary", "", "목차"));

  const list = createElement("ol", "toc-list");
  [
    ["상품 정보", "#product-info"],
    ["구매 전 확인 포인트", "#check-points"],
    ["가격 및 링크 확인", "#price-link"],
    ["자료 기준", "#source-check"]
  ].forEach(([label, href]) => {
    const item = document.createElement("li");
    item.append(createLink("", label, href));
    list.append(item);
  });
  details.append(list);
  parent.append(details);
}

function appendVisual(parent, product) {
  const figure = createElement("figure", "article-visual");
  const image = document.createElement("img");
  image.src = productImage(product);
  image.alt = productName(product);
  image.loading = "lazy";
  image.decoding = "async";
  image.referrerPolicy = "no-referrer";
  image.addEventListener("error", () => {
    figure.classList.add("image-missing");
    image.remove();
    figure.append(createElement("strong", "", "상품 이미지 확인"));
    figure.append(createElement("span", "", "이미지는 쿠팡 상품 페이지에서 다시 확인하세요."));
  });
  figure.append(image);
  parent.append(figure);
}

function appendCheckList(parent, product) {
  const list = createElement("ul", "check-list");
  getBenefits(product).forEach((benefit) => list.append(createElement("li", "", benefit)));
  parent.append(list);
}

function appendRelated(parent, product, products) {
  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  if (!related.length) return;

  const footer = createElement("nav", "post-navigation");
  footer.setAttribute("aria-label", "관련 자료");
  footer.append(createLink("", "상품자료 목록", "./#recommendations"));
  footer.append(createLink("", related[0] ? `${productName(related[0])} 보기` : "다음 자료", `./product.html?id=${encodeURIComponent(text(related[0].id))}`));
  parent.append(footer);
}

function renderMissing() {
  detailRoot.innerHTML = "";
  detailRoot.append(createElement("h1", "", "상품 자료를 찾을 수 없습니다"));
  detailRoot.append(createElement("p", "entry-description", "주소가 잘못되었거나 등록 자료에서 제외된 상품입니다. 메인 화면에서 다시 확인해주세요."));
  detailRoot.append(createLink("read-more", "자료 목록 보기", "./"));
}

function renderDetail(product, products) {
  detailRoot.innerHTML = "";
  document.title = `${productName(product)} | 픽앤세일 생활상품 자료`;

  const breadcrumbs = createElement("nav", "breadcrumbs");
  breadcrumbs.setAttribute("aria-label", "현재 위치");
  breadcrumbs.append(createLink("", "홈", "./"));
  breadcrumbs.append(createElement("span", "", "/"));
  breadcrumbs.append(createLink("", "상품자료", "./#recommendations"));
  breadcrumbs.append(createElement("span", "", "/"));
  breadcrumbs.append(createElement("span", "", productName(product)));
  detailRoot.append(breadcrumbs);

  const header = createElement("header", "entry-header");
  const meta = createElement("p", "entry-meta");
  meta.append(createLink("category-chip", text(product.category, "상품자료"), "./#recommendations"));
  meta.append(createElement("span", "", TODAY_LABEL));
  meta.append(createElement("span", "", "·"));
  meta.append(createElement("span", "", `최종 확인 ${TODAY_LABEL}`));
  header.append(meta);
  header.append(createElement("h1", "", productName(product)));
  header.append(createElement("p", "entry-description", product.summary || "확인 가능한 상품명, 가격 표시, 링크 기준으로 정리한 생활상품 자료입니다."));
  detailRoot.append(header);

  const content = createElement("section", "article-content");
  content.setAttribute("data-post-content", "");
  content.append(createElement("p", "lead", "구매 전에 먼저 볼 수 있도록 상품명, 표시 가격, 주요 확인 포인트를 한 번에 정리했습니다. 가격, 쿠폰, 배송 조건은 판매 페이지 상황에 따라 달라질 수 있습니다."));
  appendTableOfContents(content);
  appendKeyFacts(content, product);

  content.append(createElement("h2", "", "상품 정보"));
  content.lastElementChild.id = "product-info";
  appendVisual(content, product);
  content.append(createElement("p", "", product.summary || `${productName(product)} 상품입니다. 확인 가능한 정보 기준으로 정리했습니다.`));

  content.append(createElement("h2", "", "구매 전 확인 포인트"));
  content.lastElementChild.id = "check-points";
  appendCheckList(content, product);

  content.append(createElement("h2", "", "가격 및 링크 확인"));
  content.lastElementChild.id = "price-link";
  content.append(createElement("p", "", "표시 가격은 참고용입니다. 쿠폰 적용, 옵션 선택, 배송비, 재고에 따라 실제 결제 금액이 달라질 수 있으니 구매 전 판매 페이지에서 최신 조건을 확인하세요."));
  const action = createLink("detail-action", "쿠팡 상품 페이지 확인", productUrl(product));
  action.target = "_blank";
  action.rel = "nofollow sponsored noopener";
  content.append(action);

  content.append(createElement("h2", "", "자료 기준"));
  content.lastElementChild.id = "source-check";
  content.append(createElement("p", "", "이 자료는 등록된 상품명, 이미지, 표시 가격, 카테고리, 상품 링크처럼 확인 가능한 항목을 기준으로 작성했습니다. 확인되지 않은 상품평, 쿠폰, 배송 조건은 단정해서 표시하지 않습니다."));
  detailRoot.append(content);

  const sources = createElement("footer", "official-sources");
  sources.append(createElement("h2", "", "확인 출처"));
  sources.append(createElement("p", "", `최종 확인일 ${TODAY_LABEL}`));
  const sourceList = createElement("ul", "");
  const sourceItem = createElement("li", "");
  const sourceLink = createLink("", "쿠팡 상품 페이지", productUrl(product));
  sourceLink.target = "_blank";
  sourceLink.rel = "nofollow sponsored noopener";
  sourceItem.append(sourceLink);
  sourceList.append(sourceItem);
  sources.append(sourceList);
  detailRoot.append(sources);

  appendRelated(detailRoot, product, products);
}

async function start() {
  try {
    const response = await fetch("./products.json?v=support-info-20260816");
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
