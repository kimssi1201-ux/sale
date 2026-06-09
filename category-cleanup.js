(function () {
  var root = document.documentElement;
  root.setAttribute('data-category-cleanup-loaded', 'timeout');

  var fallback = '\uc0dd\ud65c\uc6a9\ud488';
  var groups = [
    ['\uc7a5\ub9c8\u00b7\uc2b5\uae30\uad00\ub9ac', ['\uc81c\uc2b5\uae30', '\uc81c\uc2b5\uc81c', '\uc2b5\uae30', '\ubb3c\uba39', '\ubc29\uc2b5', '\uacb0\ub85c', '\uacf0\ud321\uc774']],
    ['\ub354\uc704\u00b7\ub0c9\ubc29\uac00\uc804', ['\uc120\ud48d\uae30', '\uc368\ud058\ub808\uc774\ud130', '\uc11c\ud058\ub808\uc774\ud130', '\uc21c\ud658\ud32c', '\ub0c9\ud48d\uae30', '\ub0c9\ubc29', 'bldc']],
    ['\ub0c9\uac10\u00b7\uc5ec\ub984\uce68\uad6c', ['\ub0c9\uac10', '\ucfe8\ub9e4\ud2b8', '\ucfe8 \ub9e4\ud2b8', '\uc5ec\ub984\uc774\ubd88', '\uc5ec\ub984 \uc774\ubd88', '\ucc28\ub835', '\uce68\uad6c', '\ud328\ub4dc', '\ud1a0\ud37c']],
    ['\ubb3c\ub180\uc774\u00b7\uc218\uc601', ['\uc544\ucfe0\uc544\uc288\uc988', '\uc544\ucfe0\uc544 \uc288\uc988', '\ubb3c\ub180\uc774', '\ud29c\ube0c', '\uc218\uc601', '\uc6cc\ud130\ud30c\ud06c', '\ube44\uce58', '\ub798\uc26c\uac00\ub4dc', '\ud480\uc7a5', '\uc218\uacbd']],
    ['\ucea0\ud551\u00b7\ud53c\ud06c\ub2c9', ['\ucea0\ud551', '\ud0c0\ud504', '\uc544\uc774\uc2a4\ubc15\uc2a4', '\ucfe8\ub7ec', '\ucfe8\ub7ec\ubc31', '\ubcf4\ub0c9', '\ud53c\ud06c\ub2c9', '\ucc28\ubc15', '\uadf8\ub298\ub9c9', '\ud150\ud2b8', '\uc544\uc6c3\ub3c4\uc5b4']],
    ['\ucc28\ub7c9\u00b7\uc5ec\ub984\uad00\ub9ac', ['\ucc28\ub7c9', '\uc790\ub3d9\ucc28', '\ud587\ube5b\uac00\ub9ac\uac1c', '\uc36c\uc250\uc774\ub4dc', '\uc120\uc250\uc774\ub4dc', '\uc36c\ube0c\ub810\ub77c', '\ucee4\ubc84', '\uc5d0\uc5b4\ucee8\ud544\ud130', '\ubd88\uc2a4\uc6d0']],
    ['\ud587\ube5b\u00b7\uc790\uc678\uc120', ['\ud587\ube5b', '\uc790\uc678\uc120', '\uc120\ud06c\ub9bc', '\uc36c\ud06c\ub9bc', '\uc120\ube14\ub85d', '\uc36c\ube14\ub85d', '\ucfe8\ud1a0\uc2dc', '\ud314\ud1a0\uc2dc', '\uc591\uc0b0', 'uv', 'spf']],
    ['\uc6b0\ube44\u00b7\ub808\uc778\uc6a9\ud488', ['\uc6b0\ube44', '\uc6b0\uc0b0', '\uc7a5\ud654', '\ub808\uc778\ubd80\uce20', '\ubc29\uc218', '\ub808\uc778\ucf54\ud2b8', '\ube44\uc637']],
    ['\ud574\ucda9\u00b7\ubaa8\uae30\ub300\ube44', ['\ud574\ucda9', '\ubaa8\uae30', '\ubc8c\ub808', '\ud1f4\uce58\uae30', '\ud1f4\uce58', '\ubc29\ucda9', '\uc0b4\ucda9', '\ub9e4\ud2b8']]
  ];

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function classify(text) {
    var value = normalize(text);
    var best = fallback;
    var bestScore = 0;

    for (var i = 0; i < groups.length; i += 1) {
      var score = 0;
      for (var j = 0; j < groups[i][1].length; j += 1) {
        var word = normalize(groups[i][1][j]);
        if (value.indexOf(word) !== -1) score += word.length;
      }
      if (score > bestScore) {
        best = groups[i][0];
        bestScore = score;
      }
    }

    return best;
  }

  function textFrom(card, selector) {
    var element = card.querySelector(selector);
    return element && element.textContent ? element.textContent : '';
  }

  function cardText(card) {
    var image = card.querySelector('img');
    return [
      textFrom(card, '.category-slide-title'),
      textFrom(card, '.fixed-pick-copy strong'),
      textFrom(card, '.product-title'),
      textFrom(card, 'h3'),
      textFrom(card, 'strong'),
      image && image.alt ? image.alt : ''
    ].join(' ');
  }

  function addButton(controls, track, label, direction, text, ariaLabel) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'slide-button';
    button.textContent = text;
    button.setAttribute('aria-label', label + ' ' + ariaLabel);
    button.onclick = function () {
      var distance = Math.max(Math.round(track.clientWidth * 0.88), 280);
      if (track.scrollBy) {
        track.scrollBy({ left: direction * distance, behavior: 'smooth' });
      } else {
        track.scrollLeft += direction * distance;
      }
    };
    controls.appendChild(button);
  }

  function makeSlideControls(track, label) {
    var controls = document.createElement('div');
    controls.className = 'slide-controls';
    addButton(controls, track, label, -1, '<', 'previous products');
    addButton(controls, track, label, 1, '>', 'next products');
    return controls;
  }

  function makeRail(name, cards) {
    var rail = document.createElement('section');
    rail.className = 'category-rail';
    rail.setAttribute('data-category', name);

    var track = document.createElement('div');
    track.className = 'category-rail-track';

    for (var i = 0; i < cards.length; i += 1) {
      var badge = cards[i].querySelector('.category-slide-badge');
      if (badge) badge.textContent = name;
      track.appendChild(cards[i]);
    }

    var head = document.createElement('div');
    head.className = 'category-rail-head';

    var titleWrap = document.createElement('div');
    var label = document.createElement('span');
    label.textContent = '\uce74\ud14c\uace0\ub9ac';
    var title = document.createElement('strong');
    title.textContent = name;
    titleWrap.appendChild(label);
    titleWrap.appendChild(title);

    var meta = document.createElement('div');
    meta.className = 'category-rail-meta';
    var count = document.createElement('em');
    count.textContent = String(cards.length) + '\uac1c';
    meta.appendChild(count);
    meta.appendChild(makeSlideControls(track, name));

    head.appendChild(titleWrap);
    head.appendChild(meta);
    rail.appendChild(head);
    rail.appendChild(track);
    return rail;
  }

  function normalizeFixedCards() {
    var cards = toArray(document.querySelectorAll('.fixed-pick-card'));
    for (var i = 0; i < cards.length; i += 1) {
      var badge = cards[i].querySelector('.fixed-pick-badge');
      if (badge) badge.textContent = classify(cardText(cards[i]));
    }
  }

  function normalizeProductCards() {
    var cards = toArray(document.querySelectorAll('.product-card'));
    for (var i = 0; i < cards.length; i += 1) {
      var name = classify(cardText(cards[i]));
      var categoryLabel = cards[i].querySelector('.product-category');
      var badge = cards[i].querySelector('.product-badge');
      if (categoryLabel) categoryLabel.textContent = name;
      if (badge) badge.textContent = name;
    }
  }

  var lastSignature = '';
  var busy = false;

  function normalizeCategoryRails() {
    var sections = document.querySelector('#categorySliderSections');
    if (!sections || busy) return;

    var cards = toArray(sections.querySelectorAll('.category-slide-card'));
    if (!cards.length) return;

    var signatureParts = [];
    for (var i = 0; i < cards.length; i += 1) {
      var rail = cards[i].parentNode;
      while (rail && rail.className !== 'category-rail') rail = rail.parentNode;
      signatureParts.push([(rail && rail.getAttribute('data-category')) || '', cards[i].href || '', cardText(cards[i])].join('|'));
    }
    var signature = signatureParts.join('||');
    if (signature === lastSignature) return;
    lastSignature = signature;

    var grouped = {};
    var keys = [];
    for (var j = 0; j < cards.length; j += 1) {
      var name = classify(cardText(cards[j]));
      if (!grouped[name]) {
        grouped[name] = [];
        keys.push(name);
      }
      grouped[name].push(cards[j]);
    }

    busy = true;
    sections.innerHTML = '';

    for (var g = 0; g < groups.length; g += 1) {
      var orderedName = groups[g][0];
      if (grouped[orderedName]) sections.appendChild(makeRail(orderedName, grouped[orderedName]));
    }
    for (var k = 0; k < keys.length; k += 1) {
      if (groups.map(function (item) { return item[0]; }).indexOf(keys[k]) === -1) {
        sections.appendChild(makeRail(keys[k], grouped[keys[k]]));
      }
    }

    busy = false;
  }

  function runCleanup() {
    normalizeFixedCards();
    normalizeProductCards();
    normalizeCategoryRails();
  }

  var runCount = 0;
  function tick() {
    try {
      runCleanup();
      root.setAttribute('data-category-cleanup-runs', String(runCount + 1));
    } catch (error) {
      root.setAttribute('data-category-cleanup-error', error && error.message ? error.message : 'error');
    }

    runCount += 1;
    if (runCount < 90) window.setTimeout(tick, runCount < 12 ? 300 : 1000);
  }

  window.setTimeout(tick, 0);
})();
