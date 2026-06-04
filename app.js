const products = [
  {
    id: 'vacuum',
    name: '가볍게 쓰는 무선 스틱 청소기',
    category: '생활가전',
    imageUrl: '',
    copy: '가볍고 보관이 쉬운 무선 청소기를 찾는다면 이 제품을 먼저 확인해보세요. 원룸, 거실, 차량까지 빠르게 관리하기 좋고 매일 청소 부담을 줄여줍니다.',
    badge: '집안관리',
    score: '추천도 92',
    tags: ['오늘추천', '후기중심', '무선'],
    productUrl: 'https://www.coupang.com/'
  },
  {
    id: 'air-fryer',
    name: '2인 가구용 컴팩트 에어프라이어',
    category: '주방',
    imageUrl: '',
    copy: '간식과 냉동식품을 자주 조리한다면 컴팩트 에어프라이어가 편합니다. 공간을 적게 차지하고 1~2인 가구 주방에 잘 맞습니다.',
    badge: '주방필수',
    score: '추천도 89',
    tags: ['오늘추천', '선물추천', '간편조리'],
    productUrl: 'https://www.coupang.com/'
  },
  {
    id: 'keyboard',
    name: '깔끔한 데스크용 기계식 키보드',
    category: '디지털',
    imageUrl: '',
    copy: '책상 분위기를 깔끔하게 바꾸고 싶다면 키보드부터 바꿔보세요. 재택근무, 문서 작업, 공부용으로 매일 쓰기 좋은 데스크 아이템입니다.',
    badge: '디지털',
    score: '추천도 88',
    tags: ['후기중심', '데스크', '선물추천'],
    productUrl: 'https://www.coupang.com/'
  },
  {
    id: 'pet-food',
    name: '반려견 데일리 사료 추천 묶음',
    category: '반려',
    imageUrl: '',
    copy: '매일 먹는 반려견 사료는 꾸준히 비교해보고 고르는 게 좋습니다. 재구매가 잦은 상품이라 링크를 저장해두면 다음 구매도 편합니다.',
    badge: '반려가정',
    score: '추천도 91',
    tags: ['오늘추천', '반려', '재구매'],
    productUrl: 'https://www.coupang.com/'
  },
  {
    id: 'baby-wipes',
    name: '매일 쓰는 대용량 아기 물티슈',
    category: '육아',
    imageUrl: '',
    copy: '아기 물티슈는 육아, 외출, 간단한 청소까지 사용량이 많습니다. 떨어지기 전에 대용량으로 준비해두면 훨씬 편합니다.',
    badge: '생활소모품',
    score: '추천도 90',
    tags: ['오늘추천', '육아', '대용량'],
    productUrl: 'https://www.coupang.com/'
  },
  {
    id: 'lantern',
    name: '캠핑 감성 충전식 랜턴',
    category: '캠핑',
    imageUrl: '',
    copy: '캠핑 분위기를 살리고 싶다면 랜턴 하나만 바꿔도 체감이 큽니다. 차박, 캠핑, 베란다 휴식 공간까지 활용하기 좋습니다.',
    badge: '캠핑',
    score: '추천도 87',
    tags: ['선물추천', '충전식', '아웃도어'],
    productUrl: 'https://www.coupang.com/'
  },
  {
    id: 'skincare',
    name: '기초 루틴용 스킨케어 세트',
    category: '뷰티',
    imageUrl: '',
    copy: '기초 케어를 간단하게 맞추고 싶다면 세트 구성이 편합니다. 선물용으로도 부담이 적고 매일 쓰기 좋은 루틴 아이템입니다.',
    badge: '뷰티',
    score: '추천도 86',
    tags: ['후기중심', '선물추천', '기초케어'],
    productUrl: 'https://www.coupang.com/'
  },
  {
    id: 'coffee',
    name: '홈카페용 원두 커피 추천',
    category: '식품',
    imageUrl: '',
    copy: '집에서도 카페처럼 마시고 싶다면 원두부터 골라보세요. 사무실과 집에서 자주 마시는 분에게 실속 있는 홈카페 상품입니다.',
    badge: '홈카페',
    score: '추천도 85',
    tags: ['오늘추천', '식품', '홈카페'],
    productUrl: 'https://www.coupang.com/'
  }
];

const productVisuals = {
  vacuum: `
    <svg class='product-art' viewBox='0 0 120 96' aria-hidden='true'>
      <path class='art-stroke' d='M72 15 46 58' />
      <path class='art-stroke' d='M75 14h12c6 0 10 4 10 10v6' />
      <rect class='art-fill' x='77' y='24' width='24' height='26' rx='9' />
      <path class='art-stroke' d='M39 64h40' />
      <rect class='art-fill' x='25' y='65' width='50' height='16' rx='8' />
    </svg>`,
  'air-fryer': `
    <svg class='product-art' viewBox='0 0 120 96' aria-hidden='true'>
      <rect class='art-fill' x='28' y='17' width='64' height='66' rx='16' />
      <path class='art-stroke' d='M42 49h36' />
      <rect class='art-stroke' x='37' y='44' width='46' height='27' rx='7' />
      <circle class='art-stroke' cx='60' cy='32' r='8' />
    </svg>`,
  keyboard: `
    <svg class='product-art' viewBox='0 0 120 96' aria-hidden='true'>
      <rect class='art-fill' x='18' y='30' width='84' height='40' rx='9' />
      <path class='art-stroke' d='M31 43h4m12 0h4m12 0h4m12 0h4M31 57h4m12 0h4m12 0h4m12 0h10' />
    </svg>`,
  'pet-food': `
    <svg class='product-art' viewBox='0 0 120 96' aria-hidden='true'>
      <path class='art-fill' d='M40 17h34l7 66H33l7-66Z' />
      <path class='art-stroke' d='M43 33h31M35 83h47' />
      <path class='art-stroke' d='M77 67c11 0 19 4 19 9H64c0-5 4-9 13-9Z' />
    </svg>`,
  'baby-wipes': `
    <svg class='product-art' viewBox='0 0 120 96' aria-hidden='true'>
      <rect class='art-fill' x='25' y='46' width='70' height='29' rx='8' />
      <path class='art-stroke' d='M45 49c1-15 28-15 30 0' />
      <path class='art-stroke' d='M51 32c7 4 13 7 18 17' />
    </svg>`,
  lantern: `
    <svg class='product-art' viewBox='0 0 120 96' aria-hidden='true'>
      <path class='art-stroke' d='M43 28c0-13 34-13 34 0' />
      <rect class='art-fill' x='39' y='32' width='42' height='45' rx='12' />
      <path class='art-stroke' d='M48 41h24M48 68h24M60 31v47' />
    </svg>`,
  skincare: `
    <svg class='product-art' viewBox='0 0 120 96' aria-hidden='true'>
      <rect class='art-fill' x='30' y='27' width='20' height='50' rx='8' />
      <rect class='art-fill' x='56' y='18' width='22' height='59' rx='8' />
      <path class='art-stroke' d='M35 27v-8h10v8M61 18v-8h12v8M84 44h15v33H84z' />
    </svg>`,
  coffee: `
    <svg class='product-art' viewBox='0 0 120 96' aria-hidden='true'>
      <path class='art-fill' d='M38 20h44l-4 62H42L38 20Z' />
      <path class='art-stroke' d='M43 34h34M50 64c7-10 17-10 24 0' />
      <path class='art-stroke' d='M29 78c6-5 10-5 16 0M76 78c6-5 10-5 16 0' />
    </svg>`
};

const state = {
  category: '전체',
  query: ''
};

const grid = document.querySelector('#productGrid');
const template = document.querySelector('#productTemplate');
const resultCount = document.querySelector('#resultCount');
const searchInput = document.querySelector('#search');
const tabs = [...document.querySelectorAll('.category-tab')];

function matchesProduct(product) {
  const text = `${product.name} ${product.category} ${product.copy} ${product.tags.join(' ')}`;
  const matchesCategory = state.category === '전체' || product.category === state.category;
  const matchesQuery = !state.query || text.toLowerCase().includes(state.query.toLowerCase());

  return matchesCategory && matchesQuery;
}

function renderProducts() {
  const visibleProducts = products.filter(matchesProduct);
  grid.innerHTML = '';
  resultCount.textContent = `${visibleProducts.length}개`;

  if (visibleProducts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '조건에 맞는 상품이 없습니다.';
    grid.append(empty);
    return;
  }

  visibleProducts.forEach((product) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const image = card.querySelector('.product-image');
    const badge = card.querySelector('.product-badge');
    const category = card.querySelector('.product-category');
    const score = card.querySelector('.product-score');
    const title = card.querySelector('h3');
    const summary = card.querySelector('.product-summary');
    const tagRow = card.querySelector('.tag-row');
    const buyLinks = card.querySelectorAll('a');
    const productUrl = product.productUrl || product.link || '#';

    image.dataset.visual = product.id;
    if (product.imageUrl) {
      const photo = document.createElement('img');
      photo.className = 'product-photo';
      photo.src = product.imageUrl;
      photo.alt = `${product.name} 제품 이미지`;
      photo.loading = 'lazy';
      image.insertAdjacentElement('afterbegin', photo);
    } else {
      image.insertAdjacentHTML('afterbegin', productVisuals[product.id] || productVisuals.vacuum);
    }

    image.setAttribute('aria-label', `${product.name} 상품 이미지`);
    badge.textContent = product.badge;
    category.textContent = product.category;
    score.textContent = product.score;
    title.textContent = product.name;
    summary.textContent = product.copy;

    product.tags.slice(0, 3).forEach((tag) => {
      const pill = document.createElement('span');
      pill.className = 'tag';
      pill.textContent = tag;
      tagRow.append(pill);
    });

    buyLinks.forEach((link) => {
      link.href = productUrl;
      link.setAttribute('aria-label', `${product.name} 쿠팡에서 보기`);
    });

    grid.append(card);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    state.category = tab.dataset.category;
    tabs.forEach((item) => item.classList.toggle('is-active', item === tab));
    renderProducts();
  });
});

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value.trim();
  renderProducts();
});

renderProducts();
