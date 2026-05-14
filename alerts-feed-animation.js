/**
 * Циклическая анимация ленты алертов (modulate-main.html).
 * Настройка — только через объект CONFIG ниже.
 */
(function alertsFeedAnimation() {
  'use strict';

  /** @readonly Все настраиваемые параметры анимации и селекторы */
  const CONFIG = Object.freeze({
    /** Корневой блок виджета */
    SELECTOR_ROOT: '[data-mm-alerts-feed]',
    /** Элемент со списком строк (получает translateY) */
    SELECTOR_TRACK: '.mm-alerts-feed-track',
    SELECTOR_ALERT: '.alerts-widget__alert',
    READ_CLASS: 'alerts-widget__alert--read',
    SELECTOR_STATUS: '.alerts-widget__status',

    /**
     * Сколько строк видно в окне (должно совпадать с --aw-visible-rows в modulate-main.css).
     */
    VISIBLE_ROW_COUNT: 5,

    /**
     * Пауза «верхний непрочитанный»: случайно между MIN и MAX (около 3 с ± 0.5 с), мс.
     */
    UNREAD_DWELL_MS_MIN: 2500,
    UNREAD_DWELL_MS_MAX: 3500,

    /** Пауза после завершения сдвига до начала следующего интервала непрочитанности, мс */
    POST_SLIDE_GAP_MS: 0,

    /** Длительность одного сдвига translateY, мс */
    SLIDE_DURATION_MS: 420,

    /** CSS easing для сдвига */
    SLIDE_TIMING_FUNCTION: 'cubic-bezier(0.33, 1, 0.68, 1)',

    /** Страховка, если transitionend не сработал, мс к длительности сдвига */
    SLIDE_FALLBACK_EXTRA_MS: 80,

    /** Задержка перед первым циклом после инициализации, мс */
    INITIAL_DELAY_MS: 600,

    /** Пауза после полного сброса до следующего цикла, мс */
    BETWEEN_CYCLES_MS: 800,

    /** Debounce пересчёта позиции при resize, мс */
    RESIZE_DEBOUNCE_MS: 120,

    /** Учитывать prefers-reduced-motion */
    RESPECT_REDUCED_MOTION: true,

    /** Диапазон пауз при prefers-reduced-motion, мс */
    REDUCED_MOTION_UNREAD_DWELL_MS_MIN: 500,
    REDUCED_MOTION_UNREAD_DWELL_MS_MAX: 700,
    REDUCED_MOTION_POST_SLIDE_GAP_MS: 0,
    REDUCED_MOTION_BETWEEN_CYCLES_MS: 400,
    REDUCED_MOTION_INITIAL_DELAY_MS: 200,

    /** Строка статистики в шапке (modulate-main.html) */
    SELECTOR_STATS_BLOCK: '[data-mm-alerts-stats]',
    SELECTOR_STAT_ALERTS: '[data-mm-stat-alerts]',
    SELECTOR_STAT_CRITICAL: '[data-mm-stat-critical]',
    SELECTOR_STAT_ESCALATED: '[data-mm-stat-escalated]',
    SELECTOR_ESCALATED_STATUS: '.alerts-widget__pill--escalated',

    /** Вероятность +1 к critical при появлении нового алерта в ленте */
    CRITICAL_BUMP_PROBABILITY: 0.2,

    /** Задержка перед появлением статуса (fade + сдвиг), мс */
    STATUS_REVEAL_DELAY_MS: 1000,
  });

  function prefersReducedMotion() {
    return (
      CONFIG.RESPECT_REDUCED_MOTION &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function randomUnreadDwellMs() {
    var min = CONFIG.UNREAD_DWELL_MS_MIN;
    var max = CONFIG.UNREAD_DWELL_MS_MAX;
    if (prefersReducedMotion()) {
      min = CONFIG.REDUCED_MOTION_UNREAD_DWELL_MS_MIN;
      max = CONFIG.REDUCED_MOTION_UNREAD_DWELL_MS_MAX;
    }
    if (max <= min) return min;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function motionSlideMs() {
    return prefersReducedMotion() ? 0 : CONFIG.SLIDE_DURATION_MS;
  }

  function motionPostSlideGapMs() {
    return prefersReducedMotion()
      ? CONFIG.REDUCED_MOTION_POST_SLIDE_GAP_MS
      : CONFIG.POST_SLIDE_GAP_MS;
  }

  function motionBetweenCyclesMs() {
    return prefersReducedMotion()
      ? CONFIG.REDUCED_MOTION_BETWEEN_CYCLES_MS
      : CONFIG.BETWEEN_CYCLES_MS;
  }

  function motionInitialDelayMs() {
    return prefersReducedMotion()
      ? CONFIG.REDUCED_MOTION_INITIAL_DELAY_MS
      : CONFIG.INITIAL_DELAY_MS;
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function translateYPxForTopIndex(articles, topUnreadIndex) {
    return -articles[topUnreadIndex].offsetTop;
  }

  function applyTranslateInstant(track, yPx) {
    track.style.transition = 'none';
    track.style.transform = 'translateY(' + yPx + 'px)';
    void track.offsetHeight;
    track.style.removeProperty('transition');
  }

  /**
   * Индекс верхнего непрочитанного в окне — topUnreadIndex.
   * Выше него в DOM (меньший индекс) ещё не показывали — тоже без «прочитано».
   * Ниже — все прочитаны.
   */
  function syncReadState(articles, topUnreadIndex) {
    articles.forEach(function (el, i) {
      if (i > topUnreadIndex) {
        el.classList.add(CONFIG.READ_CLASS);
      } else {
        el.classList.remove(CONFIG.READ_CLASS);
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
      'Alert summary: ' +
        alertsN +
        ' alerts today, ' +
        criticalN +
        ' critical, ' +
        escalatedN +
        ' escalated'
    );
  }

  function finalizeStatusReveal(article) {
    if (!article) return;
    var timerId = article._mmStatusRevealTimer;
    if (timerId != null) {
      clearTimeout(timerId);
      article._mmStatusRevealTimer = null;
    }
    var status = article.querySelector(CONFIG.SELECTOR_STATUS);
    if (!status) return;
    status.classList.remove(
      'mm-status-reveal',
      'mm-status-reveal--prep',
      'mm-status-reveal--run'
    );
    status.removeAttribute('aria-hidden');
  }

  function scheduleTopUnreadStatusReveal(article) {
    if (!article) return;
    finalizeStatusReveal(article);

    var status = article.querySelector(CONFIG.SELECTOR_STATUS);
    if (!status) return;

    if (prefersReducedMotion()) {
      return;
    }

    status.classList.add('mm-status-reveal', 'mm-status-reveal--prep');
    status.setAttribute('aria-hidden', 'true');

    article._mmStatusRevealTimer = setTimeout(function () {
      article._mmStatusRevealTimer = null;
      status.classList.remove('mm-status-reveal--prep');
      status.classList.add('mm-status-reveal--run');
      status.removeAttribute('aria-hidden');
    }, CONFIG.STATUS_REVEAL_DELAY_MS);
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
      setTimeout(finish, durationMs + CONFIG.SLIDE_FALLBACK_EXTRA_MS);

      requestAnimationFrame(function () {
        if (sameFramePrep) sameFramePrep();
        track.style.transition =
          'transform ' + durationMs + 'ms ' + CONFIG.SLIDE_TIMING_FUNCTION;
        track.style.transform = 'translateY(' + yPx + 'px)';
      });
    });
  }

  function init() {
    var root = document.querySelector(CONFIG.SELECTOR_ROOT);
    if (!root) return;

    var track = root.querySelector(CONFIG.SELECTOR_TRACK);
    if (!track) {
      root.dataset.mmAlertsFeedInit = 'ready';
      return;
    }

    var articles = Array.prototype.slice.call(
      root.querySelectorAll(CONFIG.SELECTOR_ALERT)
    );
    var total = articles.length;
    var firstVisibleIndex = total - CONFIG.VISIBLE_ROW_COUNT;

    if (total <= CONFIG.VISIBLE_ROW_COUNT) {
      root.dataset.mmAlertsFeedInit = 'ready';
      return;
    }

    var topUnreadIndex = firstVisibleIndex;
    var sliding = false;

    function snapToCurrentTop() {
      applyTranslateInstant(
        track,
        translateYPxForTopIndex(articles, topUnreadIndex)
      );
    }

    syncReadState(articles, topUnreadIndex);
    snapToCurrentTop();
    root.dataset.mmAlertsFeedInit = 'ready';

    requestAnimationFrame(function () {
      scheduleTopUnreadStatusReveal(articles[topUnreadIndex]);
    });

    var statsRoot = root.querySelector(CONFIG.SELECTOR_STATS_BLOCK);
    var statAlertsEl = statsRoot
      ? statsRoot.querySelector(CONFIG.SELECTOR_STAT_ALERTS)
      : null;
    var statCriticalEl = statsRoot
      ? statsRoot.querySelector(CONFIG.SELECTOR_STAT_CRITICAL)
      : null;
    var statEscalatedEl = statsRoot
      ? statsRoot.querySelector(CONFIG.SELECTOR_STAT_ESCALATED)
      : null;

    var alertsCount =
      statAlertsEl != null ? parsePositiveInt(statAlertsEl.textContent) : 0;
    var criticalCount =
      statCriticalEl != null ? parsePositiveInt(statCriticalEl.textContent) : 0;
    var escalatedCount =
      statEscalatedEl != null
        ? parsePositiveInt(statEscalatedEl.textContent)
        : 0;

    function bumpStatsForIncomingAlert(incomingArticle) {
      if (!incomingArticle || !statsRoot) return;

      alertsCount += 1;
      if (statAlertsEl) statAlertsEl.textContent = String(alertsCount);

      if (
        incomingArticle.querySelector(CONFIG.SELECTOR_ESCALATED_STATUS) !=
        null
      ) {
        escalatedCount += 1;
        if (statEscalatedEl) statEscalatedEl.textContent = String(escalatedCount);
      }

      if (Math.random() < CONFIG.CRITICAL_BUMP_PROBABILITY) {
        criticalCount += 1;
        if (statCriticalEl) statCriticalEl.textContent = String(criticalCount);
      }

      refreshStatsAria(statsRoot, alertsCount, criticalCount, escalatedCount);
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!sliding) snapToCurrentTop();
      }, CONFIG.RESIZE_DEBOUNCE_MS);
    });

    async function animateSlideWrapped(yPx, durationMs, sameFramePrep) {
      sliding = true;
      try {
        await animateSlide(track, yPx, durationMs, sameFramePrep);
      } finally {
        sliding = false;
      }
    }

    async function runOneCycle() {
      var slideMs = motionSlideMs();
      var phaseCount = firstVisibleIndex;

      for (var step = 0; step < phaseCount; step++) {
        await sleep(randomUnreadDwellMs());

        var nextTop = topUnreadIndex - 1;
        var outgoingTopIndex = topUnreadIndex;
        bumpStatsForIncomingAlert(articles[nextTop]);
        var yPx = translateYPxForTopIndex(articles, nextTop);

        await animateSlideWrapped(yPx, slideMs, function () {
          articles[topUnreadIndex].classList.add(CONFIG.READ_CLASS);
          topUnreadIndex = nextTop;
        });

        finalizeStatusReveal(articles[outgoingTopIndex]);
        scheduleTopUnreadStatusReveal(articles[topUnreadIndex]);

        await sleep(motionPostSlideGapMs());
      }

      await sleep(randomUnreadDwellMs());

      articles.forEach(finalizeStatusReveal);
      topUnreadIndex = firstVisibleIndex;
      syncReadState(articles, topUnreadIndex);
      applyTranslateInstant(
        track,
        translateYPxForTopIndex(articles, firstVisibleIndex)
      );

      scheduleTopUnreadStatusReveal(articles[firstVisibleIndex]);

      await sleep(motionBetweenCyclesMs());
    }

    async function loop() {
      await sleep(motionInitialDelayMs());
      for (;;) {
        await runOneCycle();
      }
    }

    loop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
