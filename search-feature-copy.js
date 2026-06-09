(function () {
  var root = document.documentElement;
  root.setAttribute("data-search-feature-copy-loaded", "1");

  var useCases = [
    { words: ["선풍기", "서큘레이터", "써큘레이터", "냉풍", "bldc"], text: "실내 더위와 공기 순환을 챙길 때", benefit: "거실, 침실, 사무실 냉방 보조용으로 비교하기 좋음" },
    { words: ["세제", "리필", "청소", "주방", "욕실", "물티슈", "휴지"], text: "생활 소모품을 넉넉히 준비할 때", benefit: "용량, 개수, 리필 구성을 확인하며 비교하기 좋음" },
    { words: ["냉감", "쿨매트", "여름이불", "패드", "토퍼"], text: "잠자리 열감과 여름 침구를 바꾸고 싶을 때", benefit: "침대와 바닥 사용 환경에 맞춰 비교하기 좋음" },
    { words: ["제습", "습기", "방습", "물먹"], text: "장마철 습기와 꿉꿉함을 관리할 때", benefit: "옷장, 방, 욕실 등 습기 많은 공간용으로 비교 가능" },
    { words: ["선크림", "썬크림", "자외선", "쿨토시", "uv", "spf"], text: "자외선과 야외 노출이 신경 쓰일 때", benefit: "외출, 운전, 야외활동 전에 챙기기 좋음" },
    { words: ["캠핑", "타프", "아이스박스", "쿨러", "보냉", "피크닉"], text: "캠핑이나 야외활동을 준비할 때", benefit: "보관, 그늘, 보냉 목적에 맞춰 비교하기 좋음" },
    { words: ["아쿠아", "물놀이", "튜브", "수영", "보트"], text: "워터파크, 계곡, 수영장 준비를 할 때", benefit: "사이즈와 구성 확인이 필요한 물놀이 상품" },
    { words: ["차량", "자동차", "햇빛가리개", "에어컨필터"], text: "차량 실내 열기와 여름 운전을 준비할 때", benefit: "차종 호환과 사용 위치를 확인하며 고르기 좋음" },
    { words: ["우비", "우산", "장화", "레인", "방수"], text: "비 오는 날 외출과 장마철 대비가 필요할 때", benefit: "방수, 휴대성, 착용 사이즈를 비교하기 좋음" },
    { words: ["음료", "생수", "탄산", "커피", "라면", "과자", "식품"], text: "집이나 사무실에 먹거리를 비치할 때", benefit: "개수, 용량, 보관 방식을 확인하며 비교하기 좋음" }
  ];

  var features = [
    ["저소음", "저소음 사용감"],
    ["무소음", "소음 부담을 줄인 사용감"],
    ["bldc", "BLDC 모터"],
    ["리모컨", "리모컨 조작"],
    ["날개없는", "날개 없는 구조"],
    ["날개 없는", "날개 없는 구조"],
    ["타워형", "타워형 디자인"],
    ["스탠드", "스탠드형 사용"],
    ["무선", "무선 사용"],
    ["휴대용", "휴대용 구성"],
    ["접이식", "접이식 보관"],
    ["대용량", "대용량 구성"],
    ["고농축", "고농축 타입"],
    ["리필", "리필 구성"],
    ["세트", "세트 구성"],
    ["방수", "방수 기능"],
    ["워터프루프", "워터프루프 타입"],
    ["냉감", "냉감 소재"],
    ["고정밴드", "고정밴드 구성"],
    ["자외선", "자외선 차단"],
    ["spf", "SPF 지수 확인"],
    ["uv", "UV 차단"]
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

  function textFrom(card, selector) {
    var el = card.querySelector(selector);
    return el ? clean(el.textContent) : "";
  }

  function pickUseCase(title, category) {
    var value = lower(title + " " + category);
    for (var i = 0; i < useCases.length; i += 1) {
      for (var j = 0; j < useCases[i].words.length; j += 1) {
        if (value.indexOf(lower(useCases[i].words[j])) !== -1) return useCases[i];
      }
    }
    return { text: "상품명과 가격을 비교해 필요한 상품을 찾을 때", benefit: "상품명, 이미지, 가격을 함께 보며 비교하기 좋음" };
  }

  function pickFeatures(title) {
    var value = lower(title);
    var result = [];
    var seen = {};
    for (var i = 0; i < features.length; i += 1) {
      if (value.indexOf(lower(features[i][0])) !== -1 && !seen[features[i][1]]) {
        seen[features[i][1]] = true;
        result.push(features[i][1]);
      }
      if (result.length >= 4) break;
    }
    return result;
  }

  function pickDetails(title) {
    var matches = title.match(/\d+(?:[.,]\d+)?\s?(?:ml|mL|ML|L|l|kg|g|개|매|입|팩|장|롤|캔|병|봉|세트|p|P|cm|mm|인치|호|단|구|W|w|mAh|Ah|GB|TB)/g) || [];
    var result = [];
    var seen = {};
    for (var i = 0; i < matches.length; i += 1) {
      var item = clean(matches[i]);
      if (!seen[item]) {
        seen[item] = true;
        result.push(item);
      }
      if (result.length >= 4) break;
    }
    return result;
  }

  function rewrite(card) {
    var title = textFrom(card, "h3") || textFrom(card, "strong");
    if (!title) return;

    var category = textFrom(card, ".product-category") || textFrom(card, ".product-badge") || "추천상품";
    var price = textFrom(card, ".card-sale-price-value") || "쿠팡에서 확인 가능";
    var signature = [title, category, price, "feature"].join("|");
    if (card.getAttribute("data-search-feature-copy-signature") === signature) return;

    var useCase = pickUseCase(title, category);
    var detailList = pickDetails(title);
    var featureList = pickFeatures(title);
    var facts = detailList.length
      ? "상품명 기준 " + detailList.join(", ") + " 구성이 보여 용량과 개수를 먼저 비교하기 좋습니다."
      : featureList.length
        ? "상품명에서 " + featureList.join(", ") + " 특징이 보여 사용 환경에 맞춰 고르기 좋습니다."
        : "상품명과 이미지를 기준으로 필요한 옵션인지 먼저 확인하기 좋습니다.";

    var summary = card.querySelector(".product-summary");
    if (summary) {
      summary.textContent = "이 상품은 " + useCase.text + " 보기 좋은 " + category + "입니다. " + facts + " 현재 표시 가격은 " + price + "이며, 쿠폰·옵션·배송 조건은 쿠팡 상품 페이지에서 최종 확인하세요.";
    }

    var benefits = card.querySelector(".benefit-list");
    if (benefits) {
      var first = detailList.length
        ? "핵심 구성: " + detailList.slice(0, 3).join(", ")
        : featureList.length
          ? "주요 특징: " + featureList.slice(0, 3).join(", ")
          : category + " 용도에 맞춰 비교 가능";
      var items = [first, useCase.benefit, "현재 표시 가격 " + price + " 기준으로 빠르게 비교 가능"];
      benefits.innerHTML = "";
      for (var i = 0; i < items.length; i += 1) {
        var li = document.createElement("li");
        li.textContent = items[i];
        benefits.appendChild(li);
      }
    }

    card.setAttribute("data-search-feature-copy-signature", signature);
  }

  var runs = 0;
  function tick() {
    try {
      var cards = toArray(document.querySelectorAll(".product-card"));
      for (var i = 0; i < cards.length; i += 1) rewrite(cards[i]);
      root.setAttribute("data-search-feature-copy-runs", String(runs + 1));
      root.removeAttribute("data-search-feature-copy-error");
    } catch (error) {
      root.setAttribute("data-search-feature-copy-error", error && error.message ? error.message : "error");
    }
    runs += 1;
    if (runs < 120) window.setTimeout(tick, runs < 20 ? 350 : 1000);
  }

  window.setTimeout(tick, 160);
})();
