const products = [
  {
    id: 'vacuum',
    name: '가볍게 쓰는 무선 스틱 청소기',
    category: '생활가전',
    summary: '원룸, 거실, 차량까지 빠르게 관리하기 좋은 데일리 청소템입니다.',
    badge: '집안관리',
    score: '추천도 92',
    tags: ['오늘추천', '후기중심', '무선'],
    link: 'https://www.coupang.com/'
  },
  {
    id: 'air-fryer',
    name: '2인 가구용 컴팩트 에어프라이어',
    category: '주방',
    summary: '공간을 적게 차지하면서 간식과 냉동식품 조리에 편한 구성입니다.',
    badge: '주방필수',
    score: '추천도 89',
    tags: ['오늘추천', '선물추천', '간편조리'],
    link: 'https://www.coupang.com/'
  },
  {
    id: 'keyboard',
    name: '깔끔한 데스크용 기계식 키보드',
    category: '디지털',
    summary: '재택근무 책상에 어울리는 차분한 디자인의 입력 장비입니다.',
    badge: '디지털',
    score: '추천도 88',
    tags: ['후기중심', '데스크', '선물추천'],
    link: 'https://www.coupang.com/'
  },
  {
    id: 'pet-food',
    name: '반려견 데일리 사료 추천 묶음',
    category: '반려',
    summary: '정기적으로 구매하는 상품을 한 번에 비교하기 좋은 카테고리입니다.',
    badge: '반려가정',
    score: '추천도 91',
    tags: ['오늘추천', '반려', '재구매'],
    link: 'https://www.coupang.com/'
  },
  {
    id: 'baby-wipes',
    name: '매일 쓰는 대용량 아기 물티슈',
    category: '육아',
    summary: '육아, 청소, 외출용으로 소모량이 많은 생활 필수품입니다.',
    badge: '생활소모품',
    score: '추천도 90',
    tags: ['오늘추천', '육아', '대용량'],
    link: 'https://www.coupang.com/'
  },
  {
    id: 'lantern',
    name: '캠핑 감성 충전식 랜턴',
    category: '캠핑',
    summary: '차박, 캠핑, 베란다 휴식 공간에 두기 좋은 조명 상품입니다.',
    badge: '캠핑',
    score: '추천도 87',
    tags: ['선물추천', '충전식', '아웃도어'],
    link: 'https://www.coupang.com/'
  },
  {
    id: 'skincare',
    name: '기초 루틴용 스킨케어 세트',
    category: '뷰티',
    summary: '복잡한 성분 설명보다 기본 루틴에 맞춰 고르기 쉽게 묶었습니다.',
    badge: '뷰티',
    score: '추천도 86',
    tags: ['후기중심', '선물추천', '기초케어'],
    link: 'https://www.coupang.com/'
  },
  {
    id: 'coffee',
    name: '홈카페용 원두 커피 추천',
    category: '식품',
    summary: '사무실과 집에서 자주 마시는 원두를 취향별로 비교하기 좋습니다.',
    badge: '홈카페',
    score: '추천도 85',
    tags: ['오늘추천', '식품', '홈카페'],
    link: 'https://www.coupang.com/'
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
  const text = `${product.name} ${product.category} ${product.summary} ${product.tags.join(' ')}`;
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

    image.dataset.visual = product.id;
    image.insertAdjacentHTML('afterbegin', productVisuals[product.id] || productVisuals.vacuum);
    image.setAttribute('aria-label', `${product.name} 상품 이미지`);
    badge.textContent = product.badge;
    category.textContent = product.category;
    score.textContent = product.score;
    title.textContent = product.name;
    summary.textContent = product.summary;

    product.tags.slice(0, 3).forEach((tag) => {
      const pill = document.createElement('span');
      pill.className = 'tag';
      pill.textContent = tag;
      tagRow.append(pill);
    });

    buyLinks.forEach((link) => {
      link.href = product.link;
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
