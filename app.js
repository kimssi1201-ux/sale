const products = [
  {
    id: "laundry-detergent",
    name: "터치 라이트 고농축 세탁세제 라벤더 2.5L 4개",
    category: "생활용품",
    imageUrl: "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/6481/a19cda8a3902ae9970a9b2e53df0e3ab397eccc492871845a329d9f8e166.jpg",
    productUrl: "https://link.coupang.com/a/eiK4wyCzls",
    badge: "생활용품",
    score: "추천도 92",
    tags: ["세탁세제", "라벤더", "대용량"],
    copy: "쿠팡 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.\n\n터치 라이트 고농축 세탁세제 라벤더 2.5L 4개\n핵심 정보: 고농축 액체세제, 라벤더향, 2.5L 대용량 4개 구성으로 매일 세탁하는 집에서 넉넉하게 두고 쓰기 좋은 생활용품입니다.\n장점 1. 한 번에 여러 개를 준비해 세제 재구매 부담을 줄이기 좋습니다.\n장점 2. 액체 타입이라 평소 빨래할 때 바로 쓰기 편합니다.\n장점 3. 라벤더향으로 세탁 후 산뜻한 느낌을 기대할 수 있습니다.\n상품 링크: https://link.coupang.com/a/eiK4wyCzls\n세제는 떨어지면 바로 불편합니다. 미리 챙겨두세요.\n상품 링크: https://link.coupang.com/a/eiK4wyCzls\n#세탁세제 #액체세제 #라벤더세제 #생활용품 #쿠팡추천"
  }
];

const state = {
  category: "전체",
  query: ""
};

const grid = document.querySelector("#productGrid");
const template = document.querySelector("#productTemplate");
const resultCount = document.querySelector("#resultCount");
const searchInput = document.querySelector("#search");
const tabs = [...document.querySelectorAll(".category-tab")];

function matchesProduct(product) {
  const text = `${product.name} ${product.category} ${product.copy} ${product.tags.join(" ")}`;
  const matchesCategory = state.category === "전체" || product.category === state.category;
  const matchesQuery = !state.query || text.toLowerCase().includes(state.query.toLowerCase());

  return matchesCategory && matchesQuery;
}

function renderProducts() {
  const visibleProducts = products.filter(matchesProduct);
  grid.innerHTML = "";
  resultCount.textContent = `${visibleProducts.length}개`;

  if (visibleProducts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "조건에 맞는 상품이 없습니다.";
    grid.append(empty);
    return;
  }

  visibleProducts.forEach((product) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const image = card.querySelector(".product-image");
    const badge = card.querySelector(".product-badge");
    const category = card.querySelector(".product-category");
    const score = card.querySelector(".product-score");
    const title = card.querySelector("h3");
    const summary = card.querySelector(".product-summary");
    const tagRow = card.querySelector(".tag-row");
    const buyLinks = card.querySelectorAll("a");

    if (product.imageUrl) {
      const photo = document.createElement("img");
      photo.className = "product-photo";
      photo.src = product.imageUrl;
      photo.alt = `${product.name} 제품 이미지`;
      photo.loading = "lazy";
      image.prepend(photo);
    }

    image.setAttribute("aria-label", `${product.name} 상품 이미지`);
    badge.textContent = product.badge;
    category.textContent = product.category;
    score.textContent = product.score;
    title.textContent = product.name;
    summary.textContent = product.copy;

    product.tags.slice(0, 3).forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "tag";
      pill.textContent = tag;
      tagRow.append(pill);
    });

    buyLinks.forEach((link) => {
      link.href = product.productUrl;
      link.setAttribute("aria-label", `${product.name} 쿠팡에서 보기`);
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

renderProducts();
