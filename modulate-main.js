(function () {
  'use strict';

  /* ============================================================
     ALERT DATA
     ============================================================ */

  /**
   * Описание алертов для виджета #alerts-widget.
   * desc: текст с маркерами [[highlight]] для выделений.
   * status: 'escalated' | 'monitoring'
   * confidence: доля в процентах для UI (без слова «Confidence» — оно только в вёрстке).
   */
  var MM_ALERTS = [
    {
      title: 'Synthetic Voice in Auth',
      category: 'deepfake',
      categoryLabel: 'Deepfake',
      confidence: '94%',
      desc: 'Caller passed voiceprint using cloned audio; [[wire transfer]] initiated for [[$47,500]].',
      status: 'escalated',
    },
    {
      title: 'Impersonation Fraud',
      category: 'fraud',
      categoryLabel: 'Fraud',
      confidence: '91%',
      desc: 'Agent challenged caller; subject referenced internal ticket IDs matching a leaked dump and demanded expedited payout.',
      status: 'escalated',
    },
    {
      title: 'Account Closure Signals',
      category: 'churn',
      categoryLabel: 'Churn risk',
      confidence: '96%',
      desc: 'Repeated frustration cues and competitor mentions on line with [[Service Agent 34]].',
      status: 'monitoring',
    },
    {
      title: 'Restricted Disclosure',
      category: 'compliance',
      categoryLabel: 'Compliance',
      confidence: '89%',
      desc: 'Representative quoted unauthorized fee waiver script outside approved library during callback from [[Phoenix contact center]].',
      status: 'monitoring',
    },
    {
      title: 'Coaching Moment',
      category: 'coaching',
      categoryLabel: 'Coaching',
      confidence: '93%',
      desc: 'Talk-over ratio exceeded team baseline; positive resolution language dropped after minute four of hold music.',
      status: 'monitoring',
    },
    {
      title: 'Issue Not Resolved',
      category: 'churn',
      categoryLabel: 'Churn risk',
      confidence: '97%',
      desc: 'Customer restated the billing dispute three times; [[Tier 2 handoff]] closed without confirmation or apology language.',
      status: 'monitoring',
    },
    {
      title: 'Vishing Probe',
      category: 'fraud',
      categoryLabel: 'Fraud',
      confidence: '88%',
      desc: 'Caller requested SMS OTP read-back and [[card CVV]] while pacing pauses matched to scripted social-engineering flows.',
      status: 'escalated',
    },
    {
      title: 'Verbal Coercion',
      category: 'fraud',
      categoryLabel: 'Fraud',
      confidence: '95%',
      desc: 'Dominance-oriented tone and deadline threats tied to reversing a [[$12,400 ACH pull]] unless the agent stayed on the line.',
      status: 'escalated',
    },
    {
      title: 'Return Fraud Pattern',
      category: 'fraud',
      categoryLabel: 'Fraud',
      confidence: '92%',
      desc: 'Scripted damaged-goods story with defensive cadence and mismatched serial lookup against [[SKU registry]].',
      status: 'monitoring',
    },
    {
      title: 'Order Cancellation',
      category: 'churn',
      categoryLabel: 'Churn risk',
      confidence: '98%',
      desc: 'Finality in tone and administrative close-out phrasing; [[renewal contract]] withdrawn mid-call after pricing objection.',
      status: 'monitoring',
    },
  ];

  /**
   * Стартовые «минуты назад» только для первичного рендера (не часть контента алерта).
   * Верхний видимый в окне алерт при старте задаётся скриптом — см. init().
   */
  var MM_FEED_INITIAL_MINUTES_UI = [0, 1, 1, 2, 2, 3, 4, 5, 6, 8];

  /* ============================================================
     ALERT RENDERER
     ============================================================ */

  var KIKI_SVG =
    '<svg class="alert-behavior__kiki" viewBox="0 0 32 32" aria-hidden="true">' +
    '<use class="alert-behavior__kiki-use alert-behavior__kiki-use--fill" href="#mm-icon-behaviors"></use>' +
    '<use class="alert-behavior__kiki-use alert-behavior__kiki-use--stroke" href="#mm-icon-behaviors-outline"></use>' +
    '</svg>';

  /** Показ времени в первой колонке: только минуты или Just now */
  function formatMinutesAgo(m) {
    m = Math.max(0, Math.floor(Number(m) || 0));
    if (m <= 0) return 'Just now';
    if (m === 1) return '1 min ago';
    return m + ' min ago';
  }

  function readMinutesAgo(article) {
    var v = article.getAttribute('data-mm-minutes');
    if (v == null || v === '') return 0;
    var n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function writeMinutesAgo(article, m) {
    m = Math.max(0, Math.floor(Number(m) || 0));
    article.setAttribute('data-mm-minutes', String(m));
    var el = article.querySelector('.alerts-widget__time');
    if (el) el.textContent = formatMinutesAgo(m);
  }

  /** Входящий — Just now (0 min); у алертов строго ниже в ленте +1…10 мин (случайно). */
  function applyIncomingAlertTimes(incoming, allArticles) {
    writeMinutesAgo(incoming, 0);
    var incomingIdx = allArticles.indexOf(incoming);
    if (incomingIdx < 0) return;
    for (var i = incomingIdx + 1; i < allArticles.length; i++) {
      var a = allArticles[i];
      var add = 1 + Math.floor(Math.random() * 10);
      writeMinutesAgo(a, readMinutesAgo(a) + add);
    }
  }

  /** Превращает [[text]] в <span class="mm-highlight">text</span> */
  function parseDesc(desc) {
    return desc.replace(/\[\[(.+?)\]\]/g, '<span class="mm-highlight">$1</span>');
  }

  function buildStatusHTML(status) {
    if (status === 'escalated') {
      return (
        '<span class="alerts-widget__pill alerts-widget__pill--status alerts-widget__pill--escalated">' +
        '<span class="alerts-widget__pill-icon" aria-hidden="true">▲</span>' +
        ' Escalated' +
        '</span>'
      );
    }
    return (
      '<span class="alerts-widget__pill alerts-widget__pill--status alerts-widget__pill--monitoring">' +
      '<span class="alerts-widget__live-dot" aria-hidden="true"></span>' +
      ' Monitoring' +
      '</span>'
    );
  }

  function buildConfidenceHTML(confidencePct) {
    var v = String(confidencePct || '').trim();
    if (v.indexOf('%') === -1) v += '%';
    return (
      '<span class="alerts-widget__confidence-tag">' +
      '<span class="alerts-widget__confidence-label">Confidence </span>' +
      '<span class="alerts-widget__confidence-value">' + v + '</span>' +
      '</span>'
    );
  }

  function buildAlertEl(alert, isFresh, minutesUi) {
    var mins = minutesUi != null ? minutesUi : 0;
    var article = document.createElement('article');
    article.className = 'alerts-widget__alert' + (isFresh ? ' alerts-widget__alert--fresh' : '');
    article.setAttribute('data-mm-minutes', String(Math.max(0, Math.floor(Number(mins) || 0))));
    article.innerHTML =
      '<div class="alerts-widget__card">' +
        '<span class="alerts-widget__time">' + formatMinutesAgo(mins) + '</span>' +
        '<div class="alerts-widget__main">' +
          '<h3 class="alert-behavior">' +
            KIKI_SVG +
            '<span class="alert-behavior__title">' + alert.title + '</span>' +
            '<span class="alerts-widget__category-tag alerts-widget__category-tag--' + alert.category + '">' + alert.categoryLabel + '</span>' +
            buildConfidenceHTML(alert.confidence) +
          '</h3>' +
          '<p class="alerts-widget__desc">' + parseDesc(alert.desc) + '</p>' +
        '</div>' +
        '<div class="alerts-widget__status">' +
          buildStatusHTML(alert.status) +
        '</div>' +
      '</div>';
    return article;
  }

  /**
   * Рендерит массив алертов в указанный track-элемент.
   * Можно вызвать для любого другого виджета, передав свой trackEl и свои данные.
   */
  function renderAlerts(trackEl, alerts) {
    alerts.forEach(function (alert, idx) {
      var mins = MM_FEED_INITIAL_MINUTES_UI[idx];
      if (mins === undefined) mins = Math.max(0, idx);
      trackEl.appendChild(buildAlertEl(alert, false, mins));
    });
  }

  /* ============================================================
     ALERTS FEED ANIMATION
     ============================================================ */

  /** @readonly Все настраиваемые параметры анимации и селекторы */
  var ANIM_CONFIG = Object.freeze({
    SELECTOR_ROOT: '[data-mm-alerts-feed]',
    SELECTOR_TRACK: '.mm-alerts-feed-track',
    SELECTOR_ALERT: '.alerts-widget__alert',
    READ_CLASS: 'alerts-widget__alert--read',
    SELECTOR_STATUS: '.alerts-widget__status',

    /** Сколько строк видно в окне (совпадает с --aw-visible-rows в CSS) */
    VISIBLE_ROW_COUNT: 5,

    UNREAD_DWELL_MS_MIN: 2500,
    UNREAD_DWELL_MS_MAX: 3500,
    POST_SLIDE_GAP_MS: 0,
    SLIDE_DURATION_MS: 420,
    SLIDE_TIMING_FUNCTION: 'cubic-bezier(0.33, 1, 0.68, 1)',
    SLIDE_FALLBACK_EXTRA_MS: 80,
    INITIAL_DELAY_MS: 600,
    BETWEEN_CYCLES_MS: 800,
    RESIZE_DEBOUNCE_MS: 120,
    RESPECT_REDUCED_MOTION: true,

    REDUCED_MOTION_UNREAD_DWELL_MS_MIN: 500,
    REDUCED_MOTION_UNREAD_DWELL_MS_MAX: 700,
    REDUCED_MOTION_POST_SLIDE_GAP_MS: 0,
    REDUCED_MOTION_BETWEEN_CYCLES_MS: 400,
    REDUCED_MOTION_INITIAL_DELAY_MS: 200,

    SELECTOR_STATS_BLOCK: '[data-mm-alerts-stats]',
    SELECTOR_STAT_ALERTS: '[data-mm-stat-alerts]',
    SELECTOR_STAT_CRITICAL: '[data-mm-stat-critical]',
    SELECTOR_STAT_ESCALATED: '[data-mm-stat-escalated]',
    SELECTOR_ESCALATED_STATUS: '.alerts-widget__pill--escalated',

    CRITICAL_BUMP_PROBABILITY: 0.2,
    STATUS_REVEAL_DELAY_MS: 1000,
  });

  function prefersReducedMotion() {
    return (
      ANIM_CONFIG.RESPECT_REDUCED_MOTION &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function randomUnreadDwellMs() {
    var min = prefersReducedMotion()
      ? ANIM_CONFIG.REDUCED_MOTION_UNREAD_DWELL_MS_MIN
      : ANIM_CONFIG.UNREAD_DWELL_MS_MIN;
    var max = prefersReducedMotion()
      ? ANIM_CONFIG.REDUCED_MOTION_UNREAD_DWELL_MS_MAX
      : ANIM_CONFIG.UNREAD_DWELL_MS_MAX;
    if (max <= min) return min;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function motionSlideMs() {
    return prefersReducedMotion() ? 0 : ANIM_CONFIG.SLIDE_DURATION_MS;
  }

  function motionPostSlideGapMs() {
    return prefersReducedMotion()
      ? ANIM_CONFIG.REDUCED_MOTION_POST_SLIDE_GAP_MS
      : ANIM_CONFIG.POST_SLIDE_GAP_MS;
  }

  function motionBetweenCyclesMs() {
    return prefersReducedMotion()
      ? ANIM_CONFIG.REDUCED_MOTION_BETWEEN_CYCLES_MS
      : ANIM_CONFIG.BETWEEN_CYCLES_MS;
  }

  function motionInitialDelayMs() {
    return prefersReducedMotion()
      ? ANIM_CONFIG.REDUCED_MOTION_INITIAL_DELAY_MS
      : ANIM_CONFIG.INITIAL_DELAY_MS;
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function translateYPxForTopIndex(articles, idx) {
    return -articles[idx].offsetTop;
  }

  function applyTranslateInstant(track, yPx) {
    track.style.transition = 'none';
    track.style.transform = 'translateY(' + yPx + 'px)';
    void track.offsetHeight;
    track.style.removeProperty('transition');
  }

  function syncReadState(articles, topUnreadIndex) {
    articles.forEach(function (el, i) {
      if (i > topUnreadIndex) {
        el.classList.add(ANIM_CONFIG.READ_CLASS);
      } else {
        el.classList.remove(ANIM_CONFIG.READ_CLASS);
      }
    });
  }

  function parsePositiveInt(text) {
    var n = parseInt(String(text).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function refreshStatsAria(statsRoot, alertsN, criticalN, escalatedN) {
    if (!statsRoot) return;
    statsRoot.setAttribute(
      'aria-label',
      'Alert summary: ' + alertsN + ' alerts today, ' + criticalN + ' critical, ' + escalatedN + ' escalated'
    );
  }

  function finalizeStatusReveal(article) {
    if (!article) return;
    var timerId = article._mmStatusRevealTimer;
    if (timerId != null) {
      clearTimeout(timerId);
      article._mmStatusRevealTimer = null;
    }
    var status = article.querySelector(ANIM_CONFIG.SELECTOR_STATUS);
    if (!status) return;
    status.classList.remove('mm-status-reveal', 'mm-status-reveal--prep', 'mm-status-reveal--run');
    status.removeAttribute('aria-hidden');
  }

  function applyStatusRevealPrep(article) {
    if (!article) return;
    finalizeStatusReveal(article);
    var status = article.querySelector(ANIM_CONFIG.SELECTOR_STATUS);
    if (!status) return;
    if (prefersReducedMotion()) return;
    status.classList.add('mm-status-reveal', 'mm-status-reveal--prep');
    status.setAttribute('aria-hidden', 'true');
  }

  function startStatusRevealDelay(article) {
    if (!article) return;
    var status = article.querySelector(ANIM_CONFIG.SELECTOR_STATUS);
    if (!status) return;
    if (prefersReducedMotion()) { finalizeStatusReveal(article); return; }
    if (article._mmStatusRevealTimer != null) return;
    article._mmStatusRevealTimer = setTimeout(function () {
      article._mmStatusRevealTimer = null;
      status.classList.remove('mm-status-reveal--prep');
      status.classList.add('mm-status-reveal--run');
      status.removeAttribute('aria-hidden');
    }, ANIM_CONFIG.STATUS_REVEAL_DELAY_MS);
  }

  function scheduleTopUnreadStatusReveal(article) {
    applyStatusRevealPrep(article);
    startStatusRevealDelay(article);
  }

  function animateSlide(track, yPx, durationMs, sameFramePrep) {
    if (durationMs <= 0) {
      if (sameFramePrep) sameFramePrep();
      applyTranslateInstant(track, yPx);
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      var settled = false;
      function finish() {
        if (settled) return;
        settled = true;
        track.removeEventListener('transitionend', onEnd);
        track.style.removeProperty('transition');
        resolve();
      }
      function onEnd(e) {
        if (e.propertyName !== 'transform') return;
        finish();
      }
      track.addEventListener('transitionend', onEnd);
      setTimeout(finish, durationMs + ANIM_CONFIG.SLIDE_FALLBACK_EXTRA_MS);
      requestAnimationFrame(function () {
        if (sameFramePrep) sameFramePrep();
        track.style.transition = 'transform ' + durationMs + 'ms ' + ANIM_CONFIG.SLIDE_TIMING_FUNCTION;
        track.style.transform = 'translateY(' + yPx + 'px)';
      });
    });
  }

  function initAlertsFeedAnimation() {
    var root = document.querySelector(ANIM_CONFIG.SELECTOR_ROOT);
    if (!root) return;

    var track = root.querySelector(ANIM_CONFIG.SELECTOR_TRACK);
    if (!track) { root.dataset.mmAlertsFeedInit = 'ready'; return; }

    var articles = Array.prototype.slice.call(root.querySelectorAll(ANIM_CONFIG.SELECTOR_ALERT));
    var total = articles.length;
    var firstVisibleIndex = total - ANIM_CONFIG.VISIBLE_ROW_COUNT;

    if (total <= ANIM_CONFIG.VISIBLE_ROW_COUNT) { root.dataset.mmAlertsFeedInit = 'ready'; return; }

    var topUnreadIndex = firstVisibleIndex;
    var sliding = false;

    function snapToCurrentTop() {
      applyTranslateInstant(track, translateYPxForTopIndex(articles, topUnreadIndex));
    }

    syncReadState(articles, topUnreadIndex);
    snapToCurrentTop();
    scheduleTopUnreadStatusReveal(articles[topUnreadIndex]);
    root.dataset.mmAlertsFeedInit = 'ready';

    var statsRoot = root.querySelector(ANIM_CONFIG.SELECTOR_STATS_BLOCK);
    var statAlertsEl   = statsRoot ? statsRoot.querySelector(ANIM_CONFIG.SELECTOR_STAT_ALERTS)   : null;
    var statCriticalEl = statsRoot ? statsRoot.querySelector(ANIM_CONFIG.SELECTOR_STAT_CRITICAL) : null;
    var statEscalatedEl= statsRoot ? statsRoot.querySelector(ANIM_CONFIG.SELECTOR_STAT_ESCALATED): null;

    var alertsCount   = statAlertsEl    ? parsePositiveInt(statAlertsEl.textContent)   : 0;
    var criticalCount = statCriticalEl  ? parsePositiveInt(statCriticalEl.textContent) : 0;
    var escalatedCount= statEscalatedEl ? parsePositiveInt(statEscalatedEl.textContent): 0;

    /** Вызывается когда алерт въезжает в кадр — без escalated (он отложен). */
    function bumpStatsForIncomingAlert(incoming) {
      if (!incoming || !statsRoot) return;
      alertsCount += 1;
      if (statAlertsEl) statAlertsEl.textContent = String(alertsCount);
      if (Math.random() < ANIM_CONFIG.CRITICAL_BUMP_PROBABILITY) {
        criticalCount += 1;
        if (statCriticalEl) statCriticalEl.textContent = String(criticalCount);
      }
      refreshStatsAria(statsRoot, alertsCount, criticalCount, escalatedCount);
    }

    /** Вызывается одновременно со startStatusRevealDelay — синхронно обновляет счётчик. */
    function scheduleEscalatedBump(article) {
      if (!article || !statsRoot || !statEscalatedEl) return;
      if (article.querySelector(ANIM_CONFIG.SELECTOR_ESCALATED_STATUS) == null) return;
      setTimeout(function () {
        escalatedCount += 1;
        statEscalatedEl.textContent = String(escalatedCount);
        refreshStatsAria(statsRoot, alertsCount, criticalCount, escalatedCount);
      }, prefersReducedMotion() ? 0 : ANIM_CONFIG.STATUS_REVEAL_DELAY_MS);
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!sliding) snapToCurrentTop();
      }, ANIM_CONFIG.RESIZE_DEBOUNCE_MS);
    });

    async function animateSlideWrapped(yPx, durationMs, sameFramePrep) {
      sliding = true;
      try { await animateSlide(track, yPx, durationMs, sameFramePrep); }
      finally { sliding = false; }
    }

    /**
     * Фаза 1: прокручиваем предрендеренные алерты (articles[firstVisibleIndex..0]).
     * Это первый «проход» — такой же как был раньше, но без сброса в конце.
     */
    async function runInitialPass() {
      var slideMs = motionSlideMs();
      for (var step = 0; step < firstVisibleIndex; step++) {
        await sleep(randomUnreadDwellMs());
        var nextTop = topUnreadIndex - 1;
        var outgoingIdx = topUnreadIndex;
        articles[nextTop].classList.add('alerts-widget__alert--fresh');
        applyStatusRevealPrep(articles[nextTop]);
        bumpStatsForIncomingAlert(articles[nextTop]);
        var yPx = translateYPxForTopIndex(articles, nextTop);
        await animateSlideWrapped(yPx, slideMs, function () {
          articles[nextTop].classList.remove('alerts-widget__alert--fresh');
          applyIncomingAlertTimes(articles[nextTop], articles);
          articles[topUnreadIndex].classList.add(ANIM_CONFIG.READ_CLASS);
          topUnreadIndex = nextTop;
        });
        finalizeStatusReveal(articles[outgoingIdx]);
        startStatusRevealDelay(articles[topUnreadIndex]);
        scheduleEscalatedBump(articles[topUnreadIndex]);
        await sleep(motionPostSlideGapMs());
      }

      // После первого прохода topUnreadIndex == 0, translateY == 0.
      // Убираем из DOM хвост (элементы ниже видимой области) — они больше не нужны.
      articles.forEach(finalizeStatusReveal);
      while (articles.length > ANIM_CONFIG.VISIBLE_ROW_COUNT) {
        track.removeChild(articles.pop());
      }
      topUnreadIndex = 0;
      applyTranslateInstant(track, 0);
      syncReadState(articles, 0);
      scheduleTopUnreadStatusReveal(articles[0]);
    }

    /**
     * Фаза 2 (бесконечная): препендим следующий алерт в DOM,
     * мгновенно компенсируем сдвиг, плавно анимируем, убираем хвост.
     * Никакого сброса — цикл не имеет видимой точки перезапуска.
     */
    var dataIdx = firstVisibleIndex; // следующий алерт из MM_ALERTS

    async function showNextAlert() {
      await sleep(randomUnreadDwellMs());

      var alertData = MM_ALERTS[dataIdx % MM_ALERTS.length];
      dataIdx++;

      var newEl = buildAlertEl(alertData, true, 0);
      applyStatusRevealPrep(newEl);
      bumpStatsForIncomingAlert(newEl);

      var prevTop = articles[0];

      // Препендим — новый элемент оказывается в вершине DOM с offsetTop = 0
      track.insertBefore(newEl, track.firstChild);
      articles.unshift(newEl);

      // Мгновенно компенсируем: articles[1] (бывший top) теперь сдвинулся вниз
      applyTranslateInstant(track, -articles[1].offsetTop);

      syncReadState(articles, 0);

      // Плавно показываем новый элемент (translateY → 0); теги фейдятся в том же кадре, что и старт слайда
      await animateSlideWrapped(0, motionSlideMs(), function () {
        articles[0].classList.remove('alerts-widget__alert--fresh');
        applyIncomingAlertTimes(articles[0], articles);
      });

      finalizeStatusReveal(prevTop);
      startStatusRevealDelay(articles[0]);
      scheduleEscalatedBump(articles[0]);

      // Обновляем topUnreadIndex и snap-позицию для resize-хэндлера
      topUnreadIndex = 0;

      // Убираем хвост — держим в DOM не больше VISIBLE + 1
      while (articles.length > ANIM_CONFIG.VISIBLE_ROW_COUNT + 1) {
        var old = articles.pop();
        finalizeStatusReveal(old);
        track.removeChild(old);
      }
    }

    async function loop() {
      await sleep(motionInitialDelayMs());
      await runInitialPass();
      for (;;) {
        await showNextAlert();
      }
    }

    loop();
  }

  /* ============================================================
     HOURS COUNTER (Block 1 — stat card)
     ============================================================ */

  function initCounter() {
    var el = document.getElementById('mm-counter');
    if (!el) return;
    var base  = new Date('2026-05-03T00:00:00Z').getTime();
    var baseC = 564345937;
    var rate  = 6;
    function update() {
      el.textContent = Math.floor(baseC + (Date.now() - base) / 1000 * rate).toLocaleString();
    }
    update();
    setInterval(update, 1000);
  }

  /* ============================================================
     CUSTOM BEHAVIOR TYPING ANIMATION (Block 3 — #prompt-widget)
     ============================================================ */

  var MM_CUSTOMS = [
    { q: 'Detect when an agent skips the identity verification step', confirm: 'Saved: Identity verification skip' },
    { q: 'Flag calls where a customer mentions a competitor by name',  confirm: 'Saved: Competitive mention' },
    { q: "Alert me when a caller's tone shifts from calm to aggressive", confirm: 'Saved: Tone escalation alert' },
    { q: 'Find calls where agents promise unauthorized discounts',      confirm: 'Saved: Unauthorized discount' },
    { q: 'Detect when elderly callers are being pressured into decisions', confirm: 'Saved: Vulnerable caller pressure' },
  ];

  function initCustomTyping() {
    var textEl    = document.getElementById('mm-custom-text');
    var cursorEl  = document.getElementById('mm-custom-cursor');
    var resultEl  = document.getElementById('mm-custom-result');
    var confirmEl = document.getElementById('mm-custom-confirm');
    if (!textEl || !cursorEl || !resultEl || !confirmEl) return;

    var idx = 0;

    function typeText(str, cb) {
      var i = 0;
      textEl.textContent = '';
      resultEl.style.opacity = '0';
      cursorEl.style.display = 'inline-block';
      var iv = setInterval(function () {
        textEl.textContent += str[i++];
        if (i >= str.length) { clearInterval(iv); setTimeout(cb, 500); }
      }, 35);
    }

    function showResult(entry) {
      confirmEl.textContent = entry.confirm;
      resultEl.style.opacity = '1';
      cursorEl.style.display = 'none';
    }

    function run() {
      var entry = MM_CUSTOMS[idx % MM_CUSTOMS.length];
      typeText(entry.q, function () {
        showResult(entry);
        idx++;
        setTimeout(run, 6500);
      });
    }

    setTimeout(run, 600);
  }

  /* ============================================================
     INIT
     ============================================================ */

  function init() {
    // 1. Render alert cards from data
    var track = document.querySelector('[data-mm-alerts-feed] .mm-alerts-feed-track');
    if (track) {
      renderAlerts(track, MM_ALERTS);
      var initialArticles = track.querySelectorAll(ANIM_CONFIG.SELECTOR_ALERT);
      var n = initialArticles.length;
      if (n > ANIM_CONFIG.VISIBLE_ROW_COUNT) {
        var firstVis = n - ANIM_CONFIG.VISIBLE_ROW_COUNT;
        writeMinutesAgo(initialArticles[firstVis], 0);
      }
    }

    // 2. Start feed animation
    initAlertsFeedAnimation();

    // 3. Hours counter
    initCounter();

    // 4. Custom typing animation
    initCustomTyping();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
