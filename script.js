// Конфигурация диапазонов осей
const axisConfig = {
  // Левая зона оси X
  leftZone: {
    min: 0,
    max: 0.07, // Конец первой зоны
    labelValue: 0.1, // Значение для подписи "$0.1" (остается на 80%)
  },
  // Правая зона оси X
  rightZone: {
    min: 0.08, // Начало второй зоны (после разрыва)
    max: 1.50, // Конец второй зоны
  },
  // Ось Y
  yAxis: {
    min: 0,
    max: 5.7, // Максимальное значение оси Y
  },
  // Визуальные параметры разрыва
  break: {
    leftSectionEnd: 63, // Конец левой части в процентах
    rightSectionStart: 70, // Начало правой части в процентах
  },
  // Флаг для переключения между режимом точности и визуальной корректировки
  useVisualOffset: true, // Переключатель между режимом точности и визуальной корректировки
};

const modelsData = [
  {
    vendor: "Modulate",
    model: "velma-2-fast",
    modelType: "Fast",
    score: 4.38,
    cost: "$0.000930",
    speed: 1.737
  },
  {
    vendor: "Modulate",
    model: "velma-2",
    modelType: "Regular",
    score: 4.95,
    cost: "$0.003750",
    speed: 3.163,
    default: true
  },
  {
    vendor: "Modulate",
    model: "velma-1",
    modelType: "Regular",
    score: 4.85,
    cost: "$0.024440",
    speed: 2.176
  },
  // {
  //   vendor: "Modulate",
  //   model: "velma-2-heavy",
  //   modelType: "Heavy",
  //   score: 5.14,
  //   cost: "$0.025780",
  //   speed: 42.048
  // },
  {
    vendor: "OpenAI",
    model: "gpt-4o-mini",
    modelType: "",
    score: 1.61,
    cost: "$0.031380",
    speed: 4.099
  },
  {
    vendor: "Grok",
    model: "grok-4.1-fast-non-reasoning",
    modelType: "Fast",
    score: 2.25,
    cost: "$0.036410",
    speed: 3.385
  },
  {
    vendor: "Grok",
    model: "grok-4.1-fast-reasoning",
    modelType: "Fast",
    score: 3.39,
    cost: "$0.037320",
    speed: 10.577
  },
  {
    vendor: "Gemini",
    model: "gemini-2-flash-lite",
    modelType: "",
    score: 2.43,
    cost: "$0.050290",
    speed: 1.455,
    visualOffset: 0.1  },
  {
    vendor: "DeepSeek",
    model: "deepseek-v3.1",
    modelType: "Regular",
    score: 3.722,
    cost: "$0.054760",
    speed: 49.037
  },
  {
    vendor: "Gemini",
    model: "gemini-2-flash",
    modelType: "",
    score: 3.28,
    cost: "$0.056060",
    speed: 1.781
  },
  {
    vendor: "DeepSeek",
    model: "deepseek-v3.2",
    modelType: "",
    score: 3.94,
    cost: "$0.062040",
    speed: 29.065
  },
  {
    vendor: "Gemini",
    model: "gemini-3-flash",
    modelType: "",
    score: 3.52,
    cost: "$0.090620",
    speed: 1.997,
    visualOffset: -0.35
  },
  {
    vendor: "DeepSeek",
    model: "deepseek-r1",
    modelType: "",
    score: 4.08,
    cost: "$0.091990",
    speed: 45.543,
    visualOffset: -0.2
  },
  {
    vendor: "OpenAI",
    model: "gpt-o4",
    modelType: "",
    score: 3.03,
    cost: "$0.104280",
    speed: 17.157,
    visualOffset: -0.1
  },
  {
    vendor: "Gemini",
    model: "gemini-3-flash",
    modelType: "",
    score: 3.89,
    cost: "$0.118550",
    speed: 29.531,
    visualOffset: -0.25
  },
  {
    vendor: "OpenAI",
    model: "gpt-4o",
    modelType: "",
    score: 1.49,
    cost: "$0.173850",
    speed: 2.775
  },
  {
    vendor: "Gemini",
    model: "gemini-2.5-pro",
    modelType: "",
    score: 4.26,
    cost: "$0.283000",
    speed: 21.246,
    visualOffset: -0.1
  },
  {
    vendor: "Gemini",
    model: "gemini-3-pro",
    modelType: "",
    score: 4.28,
    cost: "$0.397580",
    speed: 39.984,
    visualOffset: 0.08
  },
  {
    vendor: "Grok",
    model: "grok-3",
    modelType: "",
    score: 3.76,
    cost: "$0.398780",
    speed: 6.064,
    visualOffset: -0.35
  },
  {
    vendor: "Grok",
    model: "grok-4-heavy",
    modelType: "",
    score: 4.36,
    cost: "$0.444790",
    speed: 37.16,
    visualOffset: 0.25
  },
  {
    vendor: "OpenAI",
    model: "gpt-5-mini",
    modelType: "",
    score: 3,
    cost: "$0.559410",
    speed: 4.351,
    visualOffset: -0.1
  },
  {
    vendor: "OpenAI",
    model: "gpt-4-turbo",
    modelType: "",
    score: 0.92,
    cost: "$0.631840",
    speed: 8.641
  },
  {
    vendor: "OpenAI",
    model: "gpt-5.2-pro",
    modelType: "",
    score: 3.73,
    cost: "$1.483230",
    speed: 62.011
  },
  {
    vendor: "OpenAI",
    model: "gpt-5.2",
    modelType: "",
    score: 3.93,
    cost: "$1.498401",
    speed: 10.964
  }
];

// Функция для парсинга стоимости из строки "$0.000930" -> 0.000930
function parseCost(costString) {
  return parseFloat(costString.replace("$", ""));
}

// Построение функций шкалы и общих параметров осей
function buildAxisScale(config) {
  const breakPoint = config.leftZone.max;
  const leftSectionEnd = config.break.leftSectionEnd;
  const rightSectionStart = config.break.rightSectionStart;

  return {
    breakPoint,
    leftSectionEnd,
    rightSectionStart,
    costToX(cost) {
      if (cost <= breakPoint) {
        const normalized =
          (cost - config.leftZone.min) /
          (config.leftZone.max - config.leftZone.min);
        return normalized * leftSectionEnd;
      }
      const normalized =
        (cost - config.rightZone.min) /
        (config.rightZone.max - config.rightZone.min);
      return rightSectionStart + normalized * (100 - rightSectionStart);
    },
    scoreToY(score) {
      const normalized =
        (score - config.yAxis.min) / (config.yAxis.max - config.yAxis.min);
      return (1 - normalized) * 100;
    },
  };
}

// Глобальные переменные для хранения точек и их данных
let pointsData = [];
let activePoint = null;
let axisScale = null;
let interactionsInitialized = false;
let currentContainer = null;
let hoverRafId = null;
let latestMouseEvent = null;

// Функция для вычисления квадрата расстояния между двумя точками
function getDistanceSquared(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

// Функция для поиска ближайшей точки к курсору
function findNearestPoint(mouseX, mouseY, container) {
  const rect = container.getBoundingClientRect();
  const containerWidth = rect.width;
  const containerHeight = rect.height;

  // Преобразуем координаты курсора в проценты относительно контейнера
  const mouseXPercent = ((mouseX - rect.left) / containerWidth) * 100;
  const mouseYPercent = ((mouseY - rect.top) / containerHeight) * 100;

  let nearestPoint = null;
  let minDistance = Infinity;

  pointsData.forEach((pointData) => {
    const distance = getDistanceSquared(
      mouseXPercent,
      mouseYPercent,
      pointData.xPercent,
      pointData.yPercent
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = pointData;
    }
  });

  return nearestPoint;
}

// Функция для подсветки точки
function highlightPoint(pointElement, modelData) {
  const container = document.querySelector(".scatterplot-aria");
  if (!container) return;

  const costLabel = container.querySelector(".scatterplot-cost-label");
  const scoreLabel = container.querySelector(".scatterplot-score-label");
  const costLabelTick = container.querySelector(".scatterplot-cost-label-tick");
  const scoreLabelTick = container.querySelector(".scatterplot-score-label-tick");

  // Убираем подсветку с предыдущей точки
  if (activePoint && activePoint.element) {
    activePoint.element.classList.remove("scatterplot-point-active");
    if (activePoint.label) {
      activePoint.label.classList.remove("scatterplot-point-label-active");
    }
  }

  // Подсвечиваем новую точку и обновляем лейблы
  if (pointElement && modelData) {
    pointElement.classList.add("scatterplot-point-active");
    // Находим соответствующий лейбл для этой точки
    const pointData = pointsData.find(p => p.element === pointElement);
    if (pointData && pointData.label) {
      pointData.label.classList.add("scatterplot-point-label-active");
    }
    activePoint = { element: pointElement, label: pointData?.label, model: modelData };

    const scale = axisScale || buildAxisScale(axisConfig);

    const cost = parseCost(modelData.cost);
    const x = scale.costToX(cost);
    const y = scale.scoreToY(modelData.score);

    // Обновляем лейбл цены и его засечку
    if (costLabel) {
      costLabel.style.left = `${x}%`;
      const decimals = modelData.vendor === "Modulate" ? 4 : 3;
      costLabel.textContent = "$" + cost.toFixed(decimals);
      costLabel.style.display = "block";
    }
    if (costLabelTick) {
      costLabelTick.style.left = `${x}%`;
      costLabelTick.style.display = "block";
    }

    // Обновляем лейбл оценки и его засечку
    if (scoreLabel) {
      scoreLabel.style.top = `${y}%`;
      scoreLabel.textContent = modelData.score.toFixed(1);
      scoreLabel.style.display = "block";
    }
    if (scoreLabelTick) {
      scoreLabelTick.style.top = `${y}%`;
      scoreLabelTick.style.display = "block";
    }
  } else {
    // Убираем активное состояние с точки и лейбла
    if (activePoint && activePoint.element) {
      activePoint.element.classList.remove("scatterplot-point-active");
      if (activePoint.label) {
        activePoint.label.classList.remove("scatterplot-point-label-active");
      }
    }
    activePoint = null;
    // Скрываем лейблы и засечки
    if (costLabel) costLabel.style.display = "none";
    if (scoreLabel) scoreLabel.style.display = "none";
    if (costLabelTick) costLabelTick.style.display = "none";
    if (scoreLabelTick) scoreLabelTick.style.display = "none";
  }
}

// Инициализация взаимодействий (навешиваем один раз)
function initInteractions(container) {
  if (!container) return;
  currentContainer = container;
  if (interactionsInitialized) return;

  const handleMove = (e) => {
    latestMouseEvent = e;
    if (hoverRafId) return;
    hoverRafId = requestAnimationFrame(() => {
      hoverRafId = null;
      if (!latestMouseEvent || !currentContainer) return;
      const nearestPointData = findNearestPoint(
        latestMouseEvent.clientX,
        latestMouseEvent.clientY,
        currentContainer
      );
      if (nearestPointData) {
        highlightPoint(nearestPointData.element, nearestPointData.model);
      }
    });
  };

  const handleLeave = () => {
    latestMouseEvent = null;
    if (hoverRafId) {
      cancelAnimationFrame(hoverRafId);
      hoverRafId = null;
    }
    highlightPoint(null, null);
  };

  container.addEventListener("mousemove", handleMove);
  container.addEventListener("mouseleave", handleLeave);
  interactionsInitialized = true;
}

// Функция для создания scatter plot
function createScatterPlot() {
  const container = document.querySelector(".scatterplot-aria");
  if (!container) return;

  axisScale = buildAxisScale(axisConfig);
  initInteractions(container);

  // Сохраняем подписи осей и background highlight перед очисткой
  const axisLabelX = container.querySelector(".scatterplot-axis-label-x");
  const axisLabelY = container.querySelector(".scatterplot-axis-label-y");
  const backgroundHighlight = container.querySelector(".scatterplot-background-highlight");

  // Очищаем контейнер и данные
  container.innerHTML = "";
  pointsData = [];
  activePoint = null;

  // Восстанавливаем background highlight
  if (backgroundHighlight) {
    container.appendChild(backgroundHighlight);
  }

  // Восстанавливаем подписи осей
  if (axisLabelX) {
    container.appendChild(axisLabelX);
  } else {
    const labelX = document.createElement("div");
    labelX.className = "scatterplot-axis-label-x";
    labelX.textContent = "Cost per hour, $0–0.01";
    container.appendChild(labelX);
  }

  if (axisLabelY) {
    container.appendChild(axisLabelY);
  } else {
    const labelY = document.createElement("div");
    labelY.className = "scatterplot-axis-label-y";
    labelY.textContent = "Accuracy score";
    container.appendChild(labelY);
  }

  const freshContainer = container;

  // Используем значения из конфига
  const BREAK_POINT = axisScale.breakPoint; // Точка разрыва
  const LEFT_SECTION_END = axisScale.leftSectionEnd;
  const RIGHT_SECTION_START = axisScale.rightSectionStart;
  const GAP_SIZE = RIGHT_SECTION_START - LEFT_SECTION_END;
  const maxCost = axisConfig.rightZone.max; // Максимальное значение оси X

  // Устанавливаем CSS переменные для горизонтальных линий сетки
  freshContainer.style.setProperty('--left-section-end', `${LEFT_SECTION_END}%`);
  freshContainer.style.setProperty('--right-section-start', `${RIGHT_SECTION_START}%`);

  // Рисуем точки как абсолютно позиционированные div'ы
  modelsData.forEach((model) => {
    const cost = parseCost(model.cost);
    const x = axisScale.costToX(cost);
    // Вычисляем displayScore с учетом visualOffset, если включен режим корректировки
    const displayScore = axisConfig.useVisualOffset && model.visualOffset !== undefined 
      ? model.score + model.visualOffset 
      : model.score;
    const y = axisScale.scoreToY(displayScore);

    const point = document.createElement("div");
    point.className = "scatterplot-point";
    point.style.left = `${x}%`;
    point.style.top = `${y}%`;
    point.dataset.vendor = model.vendor;
    point.dataset.model = model.model;
    point.dataset.modelType = model.modelType;
    point.dataset.score = model.score;
    point.dataset.cost = model.cost;
    point.dataset.speed = model.speed;

    // Создаем подпись названия модели справа от точки
    const modelLabel = document.createElement("div");
    modelLabel.className = "scatterplot-point-label";
    // Для gpt-5.2 и gpt-5.2-pro подпись слева
    if (model.model === "gpt-5.2" || model.model === "gpt-5.2-pro") {
      modelLabel.classList.add("scatterplot-point-label-left");
    }
    modelLabel.textContent = model.model;
    modelLabel.dataset.vendor = model.vendor;
    modelLabel.style.left = `${x}%`;
    modelLabel.style.top = `${y}%`;
    freshContainer.appendChild(modelLabel);

    // Сохраняем данные точки (включая лейбл)
    pointsData.push({
      element: point,
      label: modelLabel,
      model: model,
      xPercent: x,
      yPercent: y,
    });

    freshContainer.appendChild(point);
  });

  // Создаем засечки на оси Y (для каждого целого балла) - снаружи слева
  // Пропускаем 0, до максимального значения
  const maxScoreInt = Math.floor(axisConfig.yAxis.max);
  for (let score = 1; score <= maxScoreInt; score++) {
    const y = axisScale.scoreToY(score);
    // Засечка снаружи
    const tick = document.createElement("div");
    tick.className = "scatterplot-tick-y";
    tick.style.top = `${y}%`;
    freshContainer.appendChild(tick);
    
    // Горизонтальная линия сетки с разрывом в зоне разрыва оси X
    // Левая часть линии
    const gridLineLeft = document.createElement("div");
    gridLineLeft.className = "scatterplot-grid-line-y scatterplot-grid-line-y-left";
    gridLineLeft.style.top = `${y}%`;
    freshContainer.appendChild(gridLineLeft);
    
    // Правая часть линии
    const gridLineRight = document.createElement("div");
    gridLineRight.className = "scatterplot-grid-line-y scatterplot-grid-line-y-right";
    gridLineRight.style.top = `${y}%`;
    freshContainer.appendChild(gridLineRight);
    
    // Подпись для каждого значения на оси Y
    const scoreLabel = document.createElement("div");
    scoreLabel.className = "scatterplot-static-label scatterplot-static-label-score";
    scoreLabel.style.top = `${y}%`;
    scoreLabel.textContent = score.toString();
    freshContainer.appendChild(scoreLabel);
  }

  // Создаем засечки на оси X - с учетом broken axis
  // Для левой части: каждые 0.01 (цент) до точки разрыва
  // Для правой части: каждые 0.1 (10 центов) после точки разрыва до конца правой зоны
  const maxCostForTicks = axisConfig.rightZone.max;
  
  // Вычисляем фактическую ширину правой секции до максимального значения
  const maxCostXForWidth = axisScale.costToX(maxCostForTicks);
  const rightSectionActualWidth = maxCostXForWidth - RIGHT_SECTION_START;
  freshContainer.style.setProperty('--right-section-width', `${rightSectionActualWidth}%`);
  
  // Засечки для левой части (каждые 0.01 до точки разрыва)
  for (let cost = 0.01; cost <= BREAK_POINT; cost += 0.01) {
    const x = axisScale.costToX(cost);
    // Проверяем, что засечка не попадает в зону разрыва
    if (x < LEFT_SECTION_END) {
      // Засечка снаружи
      const tick = document.createElement("div");
      tick.className = "scatterplot-tick-x";
      tick.style.left = `${x}%`;
      freshContainer.appendChild(tick);
      
      // Вертикальная линия сетки для левой части (до зоны разрыва)
      const gridLineLeft = document.createElement("div");
      gridLineLeft.className = "scatterplot-grid-line-x scatterplot-grid-line-x-left";
      gridLineLeft.style.left = `${x}%`;
      freshContainer.appendChild(gridLineLeft);
      
      // Подпись для каждой засечки
      const costLabel = document.createElement("div");
      costLabel.className = "scatterplot-static-label scatterplot-static-label-cost";
      costLabel.style.left = `${x}%`;
      costLabel.textContent = cost === 0.01 ? "$" + cost.toFixed(2) : cost.toFixed(2);
      freshContainer.appendChild(costLabel);
    }
  }
  
  // Подпись для крайнего правого значения первой зоны (максимальное значение из конфига)
  const leftZoneMaxX = axisScale.costToX(axisConfig.leftZone.max);
  const leftZoneMaxLabel = document.createElement("div");
  leftZoneMaxLabel.className = "scatterplot-static-label scatterplot-static-label-cost";
  leftZoneMaxLabel.style.left = `${leftZoneMaxX}%`;
  leftZoneMaxLabel.textContent = "$" + axisConfig.leftZone.max.toFixed(2);
  freshContainer.appendChild(leftZoneMaxLabel);
  
  // Засечки для правой части (каждые 0.1 после точки разрыва до $2.0)
  for (let cost = BREAK_POINT + 0.1; cost <= maxCostForTicks; cost += 0.1) {
    const x = axisScale.costToX(cost);
    // Проверяем, что засечка не попадает в зону разрыва
    if (x >= RIGHT_SECTION_START) {
      // Засечка снаружи
      const tick = document.createElement("div");
      tick.className = "scatterplot-tick-x";
      tick.style.left = `${x}%`;
      freshContainer.appendChild(tick);
      
      // Вертикальная линия сетки для правой части (после зоны разрыва)
      const gridLineRight = document.createElement("div");
      gridLineRight.className = "scatterplot-grid-line-x scatterplot-grid-line-x-right";
      gridLineRight.style.left = `${x}%`;
      freshContainer.appendChild(gridLineRight);
    }
  }
  
  // Подписи для правой части оси X: $0.10, $0.50, $1.00, $1.50
  const rightZoneLabels = [0.10, 0.50, 1.00, 1.50];
  rightZoneLabels.forEach((cost) => {
    if (cost <= maxCostForTicks) {
      const x = axisScale.costToX(cost);
      if (x >= RIGHT_SECTION_START) {
        const costLabel = document.createElement("div");
        costLabel.className = "scatterplot-static-label scatterplot-static-label-cost";
        costLabel.style.left = `${x}%`;
        costLabel.textContent = "$" + cost.toFixed(2);
        freshContainer.appendChild(costLabel);
      }
    }
  });

  // Создаем динамические лейблы для активной точки
  const costLabel = document.createElement("div");
  costLabel.className = "scatterplot-cost-label";
  costLabel.style.display = "none";
  freshContainer.appendChild(costLabel);

  const scoreLabel = document.createElement("div");
  scoreLabel.className = "scatterplot-score-label";
  scoreLabel.style.display = "none";
  freshContainer.appendChild(scoreLabel);

  // Создаем засечки и линии для лейблов активной точки
  const costLabelTick = document.createElement("div");
  costLabelTick.className = "scatterplot-cost-label-tick";
  costLabelTick.style.display = "none";
  freshContainer.appendChild(costLabelTick);

  const scoreLabelTick = document.createElement("div");
  scoreLabelTick.className = "scatterplot-score-label-tick";
  scoreLabelTick.style.display = "none";
  freshContainer.appendChild(scoreLabelTick);

  // Создаем визуальный элемент разрыва оси в конце первой зоны (слева)
  const axisBreakLeft = document.createElement("div");
  axisBreakLeft.className = "scatterplot-axis-break scatterplot-axis-break-left";
  axisBreakLeft.style.left = `${LEFT_SECTION_END}%`;
  axisBreakLeft.style.width = `${GAP_SIZE}%`;
  freshContainer.appendChild(axisBreakLeft);

  // Создаем визуальный элемент разрыва оси в начале второй зоны (справа)
  const axisBreakRight = document.createElement("div");
  axisBreakRight.className = "scatterplot-axis-break scatterplot-axis-break-right";
  axisBreakRight.style.left = `${RIGHT_SECTION_START}%`;
  axisBreakRight.style.width = `${GAP_SIZE}%`;
  freshContainer.appendChild(axisBreakRight);

  // Создаем статичные подписи возле штрихов
  // Ноль (0) на оси X - левее и ниже начала координат
  const zeroLabel = document.createElement("div");
  zeroLabel.className = "scatterplot-static-label scatterplot-static-label-zero";
  zeroLabel.textContent = "0";
  freshContainer.appendChild(zeroLabel);

}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  createScatterPlot();

  // Перерисовка при изменении размера окна
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      createScatterPlot();
    }, 100);
  });
});
