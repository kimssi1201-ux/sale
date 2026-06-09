(function () {
  var root = document.documentElement;
  root.setAttribute("data-search-copy-cleanup-loaded", "1");

  var fallbackRule = {
    category: "추천상품",
    use: "상품명과 가격을 비교해 필요한 상품을 찾을 때",
    benefit: "상품명, 이미지, 가격을 함께 보며 비교하기 좋음"
  };

  var rules = [
    { category: "장마·습기관리", use: "장마철 습기와 꿉꿉함을 관리할 때", benefit: "습기 많은 공간이나 장마 대비용으로 비교하기 좋음", words: ["제습", "습기", "방습", "물먹", "곰팡", "결로"] },
    { category: "더위·냉방가전", use: "실내 더위와 공기 순환을 챙길 때", benefit: "거실, 침실, 사무실 냉방 보조용으로 비교하기 좋음", words: ["선풍기", "서큘레이터", "써큘레이터", "냉풍", "냉방", "bldc"] },
    { category: "냉감·여름침구", use: "잠자리 열감과 여름 침구를 바꾸고 싶을 때", benefit: "침대, 바닥, 소파에서 시원한 사용감을 기대하며 비교 가능", words: ["냉감", "쿨매트", "쿨 매트", "여름이불", "차렵", "침구", "패드", "토퍼"] },
    { category: "물놀이·수영", use: "워터파크, 계곡, 수영장 준비를 할 때", benefit: "물놀이 전 사이즈와 구성 확인이 필요한 상품", words: ["아쿠아", "물놀이", "튜브", "수영", "워터파크", "비치", "래쉬", "보트"] },
    { category: "캠핑·피크닉", use: "캠핑, 피크닉, 차박 같은 야외활동을 준비할 때", benefit: "야외 보관, 그늘, 보냉 등 활동 목적에 맞춰 비교하기 좋음", words: ["캠핑", "타프", "아이스박스", "아이스 박스", "쿨러", "보냉", "피크닉", "차박", "텐트"] },
    { category: "차량·여름관리", use: "차량 실내 열기와 여름 운전 준비가 필요할 때", benefit: "차량 호환 여부와 사용 위치를 확인하며 고르기 좋음", words: ["차량", "자동차", "햇빛가리개", "선쉐이드", "썬쉐이드", "에어컨필터", "에어컨 필터"] },
    { category: "햇빛·자외선", use: "자외선과 야외 노출이 신경 쓰일 때", benefit: "외출, 운전, 야외활동 전 챙기기 좋은 상품", words: ["선크림", "썬크림", "선블록", "자외선", "쿨토시", "팔토시", "양산", "uv", "spf"] },
    { category: "우비·레인용품", use: "비 오는 날 외출과 장마철 대비가 필요할 때", benefit: "방수, 휴대성, 착용 사이즈를 확인하며 비교하기 좋음", words: ["우비", "우산", "장화", "레인", "방수", "비옷"] },
    { category: "해충·모기대비", use: "모기와 해충이 신경 쓰이는 공간을 관리할 때", benefit: "집, 베란다, 캠핑장처럼 사용 공간에 맞춰 비교 가능", words: ["해충", "모기", "벌레", "퇴치", "방충", "살충", "매트"] },
    { category: "식품", use: "간식, 식사 준비, 집에 비치할 먹거리를 찾을 때", benefit: "용량, 개수, 보관 방식 확인이 중요한 상품", words: ["라면", "과자", "쿠키", "식품", "쌀", "김치", "커피", "원두", "간식", "음료", "생수", "탄산", "캔", "팩"] },
    { category: "생활용품", use: "집이나 사무실에서 자주 쓰는 생활 소모품을 준비할 때", benefit: "대용량, 리필, 세트 구성을 비교하기 좋음", words: ["세제", "휴지", "물티슈", "청소", "수납", "샴푸", "바디", "주방", "욕실", "리필", "대용량"] },
    { category: "가전디지털", use: "집이나 사무실에서 쓸 전자제품을 고를 때", benefit: "성능, 크기, 전원 방식, 설치 공간을 함께 확인하기 좋음", words: ["충전", "무선", "가전", "디지털", "전기", "배터리", "led", "usb", "스마트", "이어폰"] },
    { category: "뷰티", use: "피부, 헤어, 바디 관리 상품을 찾을 때", benefit: "피부 타입, 용량, 사용 부위를 확인하며 비교하기 좋음", words: ["화장품", "크림", "로션", "앰플", "에센스", "마스크", "샴푸", "트리트먼트", "바디워시"] },
    { category: "패션잡화", use: "착용감과 사이즈가 중요한 패션 상품을 고를 때", benefit: "색상, 사이즈, 소재 정보를 확인하며 비교하기 좋음", words: ["신발", "운동화", "샌들", "의류", "셔츠", "바지", "가방", "양말", "모자"] },
    { category: "완구/취미", use: "아이 놀이, 취미, 선물용 상품을 찾을 때", benefit: "사용 연령, 구성품, 보관 방식을 확인하기 좋음", words: ["완구", "장난감", "블록", "인형", "보드게임", "취미", "키덜트"] },
    { category: "반려동물", use: "반려동물 먹거리나 생활용품을 준비할 때", benefit: "대상 동물, 용량, 사용 목적을 확인하며 비교하기 좋음", words: ["강아지", "고양이", "반려", "사료", "간식", "배변", "펫"] },
    { category: "출산/유아", use: "아이와 함께 쓰는 육아용품을 준비할 때", benefit: "연령, 안전 기준, 구성품 확인이 중요한 상품", words: ["아기", "유아", "키즈", "기저귀", "분유", "젖병", "이유식"] }
  ];

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function lower(value) {
    return clean(value).toLowerCase();
  }

  function textFrom(node, selector) {
    var element = node.querySelector(selector);
    return element ? clean(element.textContent) : "";
  }

  function getRule(title, category) {
    var value = lower(title + " " + category);
    var best = fallbackRule;
    var bestScore = 0;

    for (var i = 0; i < rules.length; i += 1) {
      var score = 0;
      if (category && clean(category) === rules[i].category) score += 20;
      for (var j = 0; j < rules[i].words.length; j += 1) {
        var word = lower(rules[i].words[j]);
        if (value.indexOf(word) !== -1) score += word.length;
      }
      if (score > bestScore) {
        best = rules[i];
        bestScore = score;
      }
    }

    return best;
  }

  function extractDetails(title) {
    var matches = title.match(/\d+(?:[.,]\d+)?\s?(?:ml|mL|ML|L|l|kg|g|개|매|입|팩|장|롤|캔|병|봉|세트|p|P|cm|mm|인치|호|단|구|W|w|mAh|Ah|GB|TB)/g) || [];
    var seen = {};
    var details = [];

    for (var i = 0; i < matches.length; i += 1) {
      var item = clean(matches[i]);
      if (!seen[item]) {
        seen[item] = true;
        details.push(item);
      }
      if (details.length >= 4) break;
    }

    return details;
  }

  function getPrice(card) {
    return (
      textFrom(card, ".card-sale-price-value") ||
      textFrom(card, ".product-price") ||
      textFrom(card, ".fixed-pick-price") ||
      "쿠팡에서 확인 가능"
    );
  }

  function detailSentence(details, category) {
    if (details.length) {
      return "상품명 기준 " + details.join(", ") + " 구성이 보여서 용량과 개수를 먼저 비교하기 좋습니다.";
    }
    if (category) {
      return category + " 상품으로, 옵션명과 상세 구성은 상품 페이지에서 확인하는 것이 좋습니다.";
    }
    return "상품명과 이미지를 기준으로 필요한 옵션인지 먼저 확인하기 좋습니다.";
  }

  function buildSummary(title, category, price, rule, details) {
    var categoryName = category || rule.category || "추천상품";
    return "이 상품은 " + rule.use + " 비교하기 좋은 " + categoryName + "입니다. " +
      detailSentence(details, categoryName) + " 현재 표시 가격은 " + price +
      "이며, 쿠폰·옵션·배송 조건은 쿠팡 상품 페이지에서 최종 확인하세요.";
  }

  function buildBenefits(category, price, rule, details) {
    var first = details.length
      ? "핵심 구성: " + details.slice(0, 3).join(", ")
      : (category || rule.category || "상품") + " 용도에 맞춰 비교 가능";

    return [
      first,
      rule.benefit,
      "현재 표시 가격 " + price + " 기준으로 빠르게 비교 가능"
    ];
  }

  function rewriteCard(card) {
    var title = textFrom(card, "h3") || textFrom(card, ".product-title") || textFrom(card, "strong");
    if (!title) return;

    var category = textFrom(card, ".product-category") || textFrom(card, ".product-badge");
    var price = getPrice(card);
    var signature = [title, category, price].join("|");
    if (card.getAttribute("data-search-copy-signature") === signature) return;

    var rule = getRule(title, category);
    var details = extractDetails(title);
    var summary = card.querySelector(".product-summary");
    var benefits = card.querySelector(".benefit-list");

    if (summary) {
      summary.textContent = buildSummary(title, category, price, rule, details);
    }

    if (benefits) {
      var items = buildBenefits(category, price, rule, details);
      benefits.innerHTML = "";
      for (var i = 0; i < items.length; i += 1) {
        var li = document.createElement("li");
        li.textContent = items[i];
        benefits.appendChild(li);
      }
    }

    card.setAttribute("data-search-copy-signature", signature);
  }

  function rewriteCards() {
    var cards = toArray(document.querySelectorAll(".product-card"));
    for (var i = 0; i < cards.length; i += 1) {
      rewriteCard(cards[i]);
    }
  }

  var runCount = 0;
  function tick() {
    try {
      rewriteCards();
      root.setAttribute("data-search-copy-cleanup-runs", String(runCount + 1));
      root.removeAttribute("data-search-copy-cleanup-error");
    } catch (error) {
      root.setAttribute("data-search-copy-cleanup-error", error && error.message ? error.message : "error");
    }

    runCount += 1;
    if (runCount < 120) window.setTimeout(tick, runCount < 20 ? 350 : 1000);
  }

  window.setTimeout(tick, 100);
})();
