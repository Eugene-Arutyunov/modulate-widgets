(function () {
  'use strict';

  /* ============================================================
     ALERT DATA
     ============================================================ */

  /**
   * Описание алертов для виджета #alerts-widget.
   * desc: текст с маркерами [[highlight]] для выделений.
   * category: суффикс BEM для цвета тега (Tone из CSV / подобранная палитра).
   * categoryLabel: текст тега как в источнике.
   * action: текст статуса как в источнике (колонка Action).
   * statusVariant: escalation — красный ▲ (+ счётчик escalated); monitoring — зелёная точка;
   *   neutral — тёмно-серый текст без иконки.
   * confidence: доля в процентах для UI (без слова «Confidence» — оно только в вёрстке).
   */
  /**
   * Порядок в DOM (индекс 0 — верх списка).
   * При загрузке видны последние VISIBLE_ROW_COUNT (Authorization Fraud → … → Billing).
   * Первый проход прокрутки раскрывает [n−5]…[0]; затем сверху — MM_ALERTS_PREPEND_PRIORITY + остальные.
   */
  var MM_ALERTS = [
    {
      title: 'New Customer Deal Risk',
      category: 'coaching',
      categoryLabel: 'Coaching Opportunity',
      confidence: '89%',
      desc: 'Rep continued pitching features to [[James at Acme Solutions]] 4 minutes after demo was agreed.',
      action: 'Flag for Coaching',
      statusVariant: 'neutral',
    },
    {
      title: 'Prohibited Commitment Made',
      category: 'liability-risk',
      categoryLabel: 'Liability Risk',
      confidence: '90%',
      desc: 'Agent promised full refund and 6-month credit to caller without supervisor sign-off.',
      action: 'Escalated',
      statusVariant: 'escalation',
    },
    {
      title: 'Consent Compliance Failure',
      category: 'compliance',
      categoryLabel: 'Compliance Violation',
      confidence: '93%',
      desc: 'Provider moved to surgical scheduling without confirming patient understood procedure risks.',
      action: 'Urgent Review',
      statusVariant: 'escalation',
    },
    {
      title: 'Unauthorized Rate Promise',
      category: 'liability-risk',
      categoryLabel: 'Liability Risk',
      confidence: '94%',
      desc: 'Loan officer quoted 4.2% fixed rate and waived origination fees without manager approval.',
      action: 'Escalated',
      statusVariant: 'escalation',
    },
    {
      title: 'User Distress Signal',
      category: 'wellbeing',
      categoryLabel: 'Wellbeing',
      confidence: '94%',
      desc: 'Prolonged silence and vocal stress markers detected; user expressed doubt about continuing service.',
      action: 'Review',
      statusVariant: 'monitoring',
    },
    {
      title: 'Stalled Deal Risk',
      category: 'deal-blocker',
      categoryLabel: 'Deal Blocker',
      confidence: '91%',
      desc: 'Prospect named VP of Engineering and finance lead as approvers; neither present on the call.',
      action: 'Schedule Followup',
      statusVariant: 'neutral',
    },
    {
      title: 'Fraudulent Claim Risk',
      category: 'fraud-risk',
      categoryLabel: 'Fraud Risk',
      confidence: '92%',
      desc: 'Inconsistent accident details across two points in call; stress markers spiked under agent follow-up.',
      action: 'Claims Review',
      statusVariant: 'neutral',
    },
    {
      title: 'Unauthorized Data Disclosure',
      category: 'compliance',
      categoryLabel: 'Compliance Violation',
      confidence: '92%',
      desc: 'Agent confirmed billing address and payment method before identity verification was complete.',
      action: 'Review',
      statusVariant: 'monitoring',
    },
    {
      title: 'Executive Impersonation Scam',
      category: 'fraud',
      categoryLabel: 'Fraud',
      confidence: '93%',
      desc: 'Caller claiming to be CEO solicited payment credentials using urgent payment language.',
      action: 'Alerted Agent',
      statusVariant: 'escalation',
    },
    {
      title: 'Identity Verification Fraud',
      category: 'fraud',
      categoryLabel: 'Fraud',
      confidence: '91%',
      desc: 'DOB, address, and PIN mismatched across three verification prompts.',
      action: 'Manual Verification',
      statusVariant: 'neutral',
    },
    {
      title: 'Security Protocol Bypass',
      category: 'compliance',
      categoryLabel: 'Compliance Violation',
      confidence: '95%',
      desc: 'Agent skipped two verification steps and granted full account access to unverified caller.',
      action: 'Urgent Review',
      statusVariant: 'escalation',
    },
    {
      title: 'Authorization Fraud Attempt',
      category: 'deepfake',
      categoryLabel: 'Deepfake',
      confidence: '94%',
      desc: 'Deepfake caller pushed agent to bypass verification, with requesting a wire of [[$47,500]] on Account #8821.',
      action: 'Alerted Agent',
      statusVariant: 'escalation',
    },
    {
      title: 'Potential Customer Churn',
      category: 'churn',
      categoryLabel: 'Churn Risk',
      confidence: '93%',
      desc: 'Renewal customer cited cost as barrier and asked about lower-tier options during retention call.',
      action: 'Review',
      statusVariant: 'monitoring',
    },
    {
      title: 'Threat-Based Harassment',
      category: 'agent-safety',
      categoryLabel: 'Agent Safety',
      confidence: '96%',
      desc: 'Caller repeated physical threat toward support agent after refund denial; warning issued, threats continued.',
      action: 'Escalated',
      statusVariant: 'escalation',
    },
    {
      title: 'Unresolved Billing Dispute',
      category: 'compliance',
      categoryLabel: 'Compliance',
      confidence: '98%',
      desc: 'Customer referenced unresolved billing dispute from prior call; fix never applied to account.',
      action: 'Claims Review',
      statusVariant: 'neutral',
    },
  ];

  /** Порядок появления новых алертов сверху после первого прохода */
  var MM_ALERTS_PREPEND_PRIORITY = [
    'Security Protocol Bypass',
    'Identity Verification Fraud',
    'Executive Impersonation Scam',
    'Unauthorized Data Disclosure',
    'Fraudulent Claim Risk',
    'Stalled Deal Risk',
    'User Distress Signal',
    'Unauthorized Rate Promise',
    'Consent Compliance Failure',
    'Prohibited Commitment Made',
    'New Customer Deal Risk',
  ];

  function buildAlertsPrependSequence(alerts, priorityTitles) {
    var seq = [];
    var seen = {};
    priorityTitles.forEach(function (title) {
      for (var i = 0; i < alerts.length; i++) {
        if (alerts[i].title === title && !seen[title]) {
          seq.push(alerts[i]);
          seen[title] = true;
          break;
        }
      }
    });
    alerts.forEach(function (alert) {
      if (!seen[alert.title]) {
        seq.push(alert);
        seen[alert.title] = true;
      }
    });
    return seq;
  }

  /**
   * Стартовые «минуты назад» только для первичного рендера (не часть контента алерта).
   * Верхний видимый в окне алерт при старте задаётся скриптом — см. init().
   */
  var MM_FEED_INITIAL_MINUTES_UI = [0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11];

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

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildStatusHTML(alert) {
    var label =
      alert.action != null && alert.action !== ''
        ? alert.action
        : alert.statusVariant === 'escalation'
          ? 'Escalation'
          : 'Review';
    var text = escapeHtml(label);
    var v = alert.statusVariant;
    if (v === 'escalation') {
      return (
        '<span class="alerts-widget__pill alerts-widget__pill--status alerts-widget__pill--escalated">' +
        '<span class="alerts-widget__pill-icon" aria-hidden="true">▲</span>' +
        '<span class="alerts-widget__pill-label">' +
        text +
        '</span>' +
        '</span>'
      );
    }
    if (v === 'monitoring') {
      return (
        '<span class="alerts-widget__pill alerts-widget__pill--status alerts-widget__pill--monitoring">' +
        '<span class="alerts-widget__live-dot" aria-hidden="true"></span>' +
        '<span class="alerts-widget__pill-label">' +
        text +
        '</span>' +
        '</span>'
      );
    }
    return (
      '<span class="alerts-widget__pill alerts-widget__pill--status alerts-widget__pill--neutral">' +
      '<span class="alerts-widget__pill-label">' +
      text +
      '</span>' +
      '</span>'
    );
  }

  /** categoryLabel длиннее — на десктопе в confidence только цифра (см. CSS) */
  var CONFIDENCE_COMPACT_LABEL_MIN_LEN = 16;

  function buildConfidenceHTML(confidencePct, categoryLabel) {
    var v = String(confidencePct || '').trim();
    if (v.indexOf('%') === -1) v += '%';
    var compact =
      categoryLabel && String(categoryLabel).length >= CONFIDENCE_COMPACT_LABEL_MIN_LEN;
    var compactClass = compact ? ' alerts-widget__confidence-tag--value-only' : '';
    return (
      '<span class="alerts-widget__confidence-tag' + compactClass + '">' +
      '<span class="alerts-widget__confidence-label">Confidence </span>' +
      '<span class="alerts-widget__confidence-value">' + v + '</span>' +
      '</span>'
    );
  }

  function buildAlertEl(alert, isFresh, minutesUi, includeStatus) {
    var mins = minutesUi != null ? minutesUi : 0;
    var showStatus = includeStatus !== false;
    var statusBlock = showStatus
      ? '<div class="alerts-widget__status">' + buildStatusHTML(alert) + '</div>'
      : '';
    var article = document.createElement('article');
    article.className = 'alerts-widget__alert' + (isFresh ? ' alerts-widget__alert--fresh' : '');
    article.setAttribute('data-mm-minutes', String(Math.max(0, Math.floor(Number(mins) || 0))));
    article.innerHTML =
      '<div class="alerts-widget__card">' +
        '<span class="alerts-widget__time">' + formatMinutesAgo(mins) + '</span>' +
        '<div class="alerts-widget__main">' +
          '<h3 class="alert-behavior">' +
            '<span class="alert-behavior__lead">' +
            KIKI_SVG +
            '<span class="alert-behavior__title">' + escapeHtml(alert.title) + '</span>' +
            '</span>' +
            '<span class="alert-behavior__tags">' +
            '<span class="alerts-widget__category-tag alerts-widget__category-tag--' + alert.category + '">' +
            escapeHtml(alert.categoryLabel) +
            '</span>' +
            buildConfidenceHTML(alert.confidence, alert.categoryLabel) +
            '</span>' +
          '</h3>' +
          '<p class="alerts-widget__desc">' + parseDesc(alert.desc) + '</p>' +
        '</div>' +
        statusBlock +
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
    VISIBLE_ROW_COUNT: 4,

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
    var prependSequence = buildAlertsPrependSequence(
      MM_ALERTS,
      MM_ALERTS_PREPEND_PRIORITY
    );
    var prependIdx = 0;

    async function showNextAlert() {
      await sleep(randomUnreadDwellMs());

      var alertData = prependSequence[prependIdx % prependSequence.length];
      prependIdx++;

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

  /**
   * Сценарии для #prompt-widget: промт, строка подтверждения, три алерта (отдельно от MM_ALERTS).
   */
  var MM_CUSTOMS = [
    {
      q: 'Detect when an agent skips required verification steps before granting account access',
      confirm: 'Saved: Security Protocol Bypass',
      alerts: [
        {
          title: 'Verification Skip',
          category: 'compliance',
          categoryLabel: 'Compliance',
          confidence: '93%',
          desc: 'Agent bypassed second factor after caller said they were in a hurry; full access granted.',
        },
        {
          title: 'Protocol Bypass',
          category: 'compliance',
          categoryLabel: 'Compliance',
          confidence: '91%',
          desc: 'Two required security questions skipped during callback; agent proceeded directly to account changes.',
        },
        {
          title: 'Access Granted Early',
          category: 'compliance',
          categoryLabel: 'Compliance',
          confidence: '94%',
          desc: 'Agent granted password reset before caller completed identity verification at [[Denver contact center]].',
        },
      ],
    },
    {
      q: 'Alert me when a caller tries to redirect payment to an unverified account',
      confirm: 'Saved: Payment Fraud Attempt',
      alerts: [
        {
          title: 'Payment Redirect',
          category: 'fraud',
          categoryLabel: 'Fraud',
          confidence: '92%',
          desc: 'Caller claimed billing error and pushed agent to update bank details without verification.',
        },
        {
          title: 'Account Takeover Attempt',
          category: 'fraud',
          categoryLabel: 'Fraud',
          confidence: '94%',
          desc: 'Urgent tone detected; caller requested ACH change on [[Account #3847]] without security challenge.',
        },
        {
          title: 'Fraud Signal',
          category: 'fraud',
          categoryLabel: 'Fraud',
          confidence: '90%',
          desc: 'Caller provided new routing number mid-call and pressured agent to skip confirmation step.',
        },
      ],
    },
    {
      q: 'Flag when a sales rep keeps selling after the customer has already agreed to move forward',
      confirm: 'Saved: Post-Commitment Pushback Risk',
      alerts: [
        {
          title: 'Over-Pitching',
          category: 'coaching',
          categoryLabel: 'Coaching',
          confidence: '89%',
          desc: 'Rep introduced two new features after prospect confirmed they were ready to sign.',
        },
        {
          title: 'Commitment Ignored',
          category: 'coaching',
          categoryLabel: 'Coaching',
          confidence: '90%',
          desc: 'Customer agreed to next steps at 11:45; rep continued competitive comparison for four more minutes.',
        },
        {
          title: 'Pitch Continued',
          category: 'coaching',
          categoryLabel: 'Coaching',
          confidence: '88%',
          desc: 'Rep kept presenting pricing tiers after [[Lisa at Northgate Partners]] confirmed she was moving forward.',
        },
      ],
    },
    {
      q: 'Detect when an agent shares account details before fully verifying the caller',
      confirm: 'Saved: Unauthorized Data Disclosure',
      alerts: [
        {
          title: 'Restricted Disclosure',
          category: 'compliance',
          categoryLabel: 'Compliance',
          confidence: '92%',
          desc: 'Agent confirmed full billing address and card type before second verification step was completed.',
        },
        {
          title: 'Data Exposure',
          category: 'compliance',
          categoryLabel: 'Compliance',
          confidence: '91%',
          desc: 'Account PIN and email shared with caller who only passed one of three verification prompts.',
        },
        {
          title: 'Verification Skip',
          category: 'compliance',
          categoryLabel: 'Compliance',
          confidence: '93%',
          desc: 'Agent read back last four digits of payment method before caller confirmed security question.',
        },
      ],
    },
  ];

  var CUSTOM_PHASE2_HOLD_MS  = 1000;
  var CUSTOM_PHASE3_HOLD_MS  = 4000;
  var CUSTOM_PHASE3_STAGGER_MS = 180;
  var CUSTOM_SUBMIT_PRESS_MS = 280;

  function initCustomTyping() {
    var textEl      = document.getElementById('mm-custom-text');
    var typedEl     = textEl && textEl.parentElement;
    var cursorEl    = document.getElementById('mm-custom-cursor');
    var submitEl    = document.getElementById('mm-custom-submit');
    var resultEl    = document.getElementById('mm-custom-result');
    var confirmEl   = document.getElementById('mm-custom-confirm');
    var detectEl    = document.getElementById('mm-custom-detections');
    if (!textEl || !cursorEl || !resultEl || !confirmEl || !detectEl) return;

    var idx = 0;
    var detectSkeletonHTML = detectEl.innerHTML;

    function positionCursor() {
      if (!cursorEl || !textEl || !typedEl) return;

      var range = document.createRange();
      var len = textEl.textContent.length;

      if (textEl.firstChild && textEl.firstChild.nodeType === 3) {
        range.setStart(textEl.firstChild, len);
        range.setEnd(textEl.firstChild, len);
      } else {
        range.setStart(textEl, 0);
        range.setEnd(textEl, 0);
      }

      var rects = range.getClientRects();
      var rect = rects.length ? rects[rects.length - 1] : range.getBoundingClientRect();
      var base = typedEl.getBoundingClientRect();

      if (!len && rect.width === 0 && rect.height === 0) {
        cursorEl.style.left = '0';
        cursorEl.style.top = '0.12em';
        return;
      }

      cursorEl.style.left = (rect.right - base.left + 2) + 'px';
      cursorEl.style.top = (rect.top - base.top) + 'px';
    }

    function animateSubmitPress(cb) {
      if (!submitEl) {
        cb();
        return;
      }
      submitEl.classList.remove('is-busy');
      submitEl.classList.add('is-pressed');
      setTimeout(function () {
        submitEl.classList.remove('is-pressed');
        submitEl.classList.add('is-busy');
        cb();
      }, CUSTOM_SUBMIT_PRESS_MS);
    }

    function typeText(str, cb) {
      var i = 0;
      textEl.textContent = '';
      resultEl.classList.remove('is-visible');
      cursorEl.style.display = 'block';
      cursorEl.classList.add('mm-cursor-blink--typing');
      if (submitEl) submitEl.classList.remove('is-pressed', 'is-busy');
      positionCursor();
      var iv = setInterval(function () {
        textEl.textContent += str[i++];
        requestAnimationFrame(positionCursor);
        if (i >= str.length) {
          clearInterval(iv);
          cursorEl.classList.remove('mm-cursor-blink--typing');
          animateSubmitPress(cb);
        }
      }, 35);
    }

    function showResult(entry) {
      confirmEl.textContent = entry.confirm;
      resultEl.classList.add('is-visible');
      cursorEl.style.display = 'none';
    }

    function resetSubmitIdle() {
      if (submitEl) submitEl.classList.remove('is-pressed', 'is-busy');
    }

    function showAlerts(alertsSlice, cb) {
      detectEl.innerHTML = '';
      detectEl.removeAttribute('data-empty');

      var list = document.createElement('div');
      list.className = 'mm-custom-detections__list';

      var n = alertsSlice.length;
      alertsSlice.forEach(function (alert) {
        var el = buildAlertEl(alert, false, 0, false);
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s ease';
        list.appendChild(el);
      });

      detectEl.appendChild(list);
      detectEl.setAttribute('data-visible', '');

      for (var pos = 0; pos < n; pos++) {
        (function (p) {
          setTimeout(function () {
            var cards = list.querySelectorAll('.alerts-widget__alert');
            if (cards[p]) cards[p].style.opacity = '1';
            if (p === 0) resetSubmitIdle();
          }, p * CUSTOM_PHASE3_STAGGER_MS);
        })(pos);
      }

      var totalFadeIn = n * CUSTOM_PHASE3_STAGGER_MS + 300;
      setTimeout(cb, Math.max(totalFadeIn, CUSTOM_PHASE3_HOLD_MS));
    }

    function resetDetectionsToSkeleton() {
      detectEl.innerHTML = detectSkeletonHTML;
      detectEl.setAttribute('data-empty', '');
      detectEl.removeAttribute('data-visible');
      detectEl.style.opacity = '';
      detectEl.style.transition = '';
    }

    function run() {
      var entry = MM_CUSTOMS[idx % MM_CUSTOMS.length];
      typeText(entry.q, function () {
        showResult(entry);
        idx++;
        setTimeout(function () {
          showAlerts(entry.alerts, function () {
            resultEl.classList.remove('is-visible');
            resetDetectionsToSkeleton();
            run();
          });
        }, CUSTOM_PHASE2_HOLD_MS);
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
