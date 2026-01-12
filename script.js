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
  {
    vendor: "Modulate",
    model: "velma-2-heavy",
    modelType: "Heavy",
    score: 5.14,
    cost: "$0.025780",
    speed: 42.048
  },
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
    speed: 1.455
  },
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
    speed: 1.997
  },
  {
    vendor: "DeepSeek",
    model: "deepseek-r1",
    modelType: "",
    score: 4.08,
    cost: "$0.091990",
    speed: 45.543
  },
  {
    vendor: "OpenAI",
    model: "gpt-o4",
    modelType: "",
    score: 3.03,
    cost: "$0.104280",
    speed: 17.157
  },
  {
    vendor: "Gemini",
    model: "gemini-3-flash",
    modelType: "",
    score: 3.89,
    cost: "$0.118550",
    speed: 29.531
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
    speed: 21.246
  },
  {
    vendor: "Gemini",
    model: "gemini-3-pro",
    modelType: "",
    score: 4.28,
    cost: "$0.397580",
    speed: 39.984
  },
  {
    vendor: "Grok",
    model: "grok-3",
    modelType: "",
    score: 3.76,
    cost: "$0.398780",
    speed: 6.064
  },
  {
    vendor: "Grok",
    model: "grok-4-heavy",
    modelType: "",
    score: 4.36,
    cost: "$0.444790",
    speed: 37.16
  },
  {
    vendor: "OpenAI",
    model: "gpt-5-mini",
    modelType: "",
    score: 3,
    cost: "$0.559410",
    speed: 4.351
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
    cost: "$1.502840",
    speed: 10.964
  }
];

// Функция для парсинга стоимости из строки "$0.000930" -> 0.000930
function parseCost(costString) {
  return parseFloat(costString.replace("$", ""));
}

// Функция для заполнения сайдбара данными модели
function updateSidebar(model) {
  const sidebar = document.querySelector(".scatterplot-sidebar");
  if (!sidebar) return;

  const labels = sidebar.querySelectorAll(".scatterplot-sidebar-label");
  const values = sidebar.querySelectorAll(".scatterplot-sidebar-value");

  // Заполняем значения
  if (labels[0] && values[0]) {
    values[0].textContent = model.vendor;
    values[0].dataset.vendor = model.vendor;
  }
  if (labels[1] && values[1]) {
    values[1].textContent = model.model;
  }
  if (labels[2] && values[2]) {
    values[2].textContent = model.modelType || "-";
  }
  if (labels[3] && values[3]) {
    values[3].textContent = model.score.toFixed(1);
  }
  if (labels[4] && values[4]) {
    // Парсим стоимость, округляем до 2 знаков (для Modulate до 4 знаков) и форматируем обратно
    const costValue = parseCost(model.cost);
    const decimals = model.vendor === "Modulate" ? 4 : 2;
    values[4].textContent = "$" + costValue.toFixed(decimals);
  }
  if (labels[5] && values[5]) {
    values[5].textContent = model.speed.toFixed(1) + "s";
  }
}

// Функция для получения модели по умолчанию
function getDefaultModel() {
  return modelsData.find((model) => model.default === true) || modelsData[0];
}

// Функция для показа модели по умолчанию в сайдбаре
function showDefaultModel() {
  const defaultModel = getDefaultModel();
  updateSidebar(defaultModel);
}

// Глобальные переменные для хранения точек и их данных
let pointsData = [];
let activePoint = null;

// Функция для вычисления расстояния между двумя точками
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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
    const distance = getDistance(
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
  }

  // Подсвечиваем новую точку и обновляем лейблы
  if (pointElement && modelData) {
    pointElement.classList.add("scatterplot-point-active");
    activePoint = { element: pointElement, model: modelData };

    // Вычисляем позиции для лейблов
    const costs = modelsData.map((d) => parseCost(d.cost));
    const scores = modelsData.map((d) => d.score);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    function costToX(cost) {
      const normalized = cost / maxCost;
      return normalized * 100; // 0% до 100%
    }

    function scoreToY(score) {
      const normalized = score / maxScore;
      return (1 - normalized) * 100; // Инвертируем Y: 0% сверху, 100% снизу
    }

    const cost = parseCost(modelData.cost);
    const x = costToX(cost);
    const y = scoreToY(modelData.score);

    // Обновляем лейбл цены и его засечку
    if (costLabel) {
      costLabel.style.left = `${x}%`;
      const decimals = modelData.vendor === "Modulate" ? 4 : 2;
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
    activePoint = null;
    // Скрываем лейблы и засечки
    if (costLabel) costLabel.style.display = "none";
    if (scoreLabel) scoreLabel.style.display = "none";
    if (costLabelTick) costLabelTick.style.display = "none";
    if (scoreLabelTick) scoreLabelTick.style.display = "none";
  }
}

// Функция для создания scatter plot
function createScatterPlot() {
  const container = document.querySelector(".scatterplot-aria");
  if (!container) return;

  // Сохраняем подписи осей перед очисткой
  const axisLabelX = container.querySelector(".scatterplot-axis-label-x");
  const axisLabelY = container.querySelector(".scatterplot-axis-label-y");

  // Очищаем контейнер и данные
  container.innerHTML = "";
  pointsData = [];
  activePoint = null;

  // Восстанавливаем подписи осей
  if (axisLabelX) {
    container.appendChild(axisLabelX);
  } else {
    const labelX = document.createElement("div");
    labelX.className = "scatterplot-axis-label-x";
    labelX.textContent = "Cost";
    container.appendChild(labelX);
  }

  if (axisLabelY) {
    container.appendChild(axisLabelY);
  } else {
    const labelY = document.createElement("div");
    labelY.className = "scatterplot-axis-label-y";
    labelY.textContent = "Score";
    container.appendChild(labelY);
  }

  const freshContainer = container;

  // Вычисляем диапазоны данных
  const costs = modelsData.map((d) => parseCost(d.cost));
  const scores = modelsData.map((d) => d.score);

  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // Функция для преобразования стоимости в X координату (в процентах)
  // Ось всегда начинается с 0
  function costToX(cost) {
    const normalized = cost / maxCost;
    return normalized * 100; // 0% до 100%
  }

  // Функция для преобразования score в Y координату (в процентах, инвертированная)
  // Ось всегда начинается с 0
  function scoreToY(score) {
    const normalized = score / maxScore;
    return (1 - normalized) * 100; // Инвертируем Y: 0% сверху, 100% снизу
  }

  // Рисуем точки как абсолютно позиционированные div'ы
  modelsData.forEach((model) => {
    const cost = parseCost(model.cost);
    const x = costToX(cost);
    const y = scoreToY(model.score);

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

    // Сохраняем данные точки
    pointsData.push({
      element: point,
      model: model,
      xPercent: x,
      yPercent: y,
    });

    freshContainer.appendChild(point);
  });

  // Создаем засечки на оси Y (для каждого целого балла) - снаружи слева
  // Пропускаем 0, ограничиваем максимальным значением данных
  const maxScoreInt = Math.floor(maxScore);
  for (let score = 1; score <= maxScoreInt; score++) {
    const y = scoreToY(score);
    const tick = document.createElement("div");
    tick.className = "scatterplot-tick-y";
    tick.style.top = `${y}%`;
    freshContainer.appendChild(tick);
  }

  // Создаем засечки на оси X (каждые 10 центов) - снаружи снизу
  // Пропускаем 0
  const maxCostRounded = Math.ceil(maxCost * 10) / 10;
  for (let cost = 0.1; cost <= maxCostRounded; cost += 0.1) {
    const x = costToX(cost);
    const tick = document.createElement("div");
    tick.className = "scatterplot-tick-x";
    tick.style.left = `${x}%`;
    freshContainer.appendChild(tick);
  }

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

  // Обработчик движения мыши внутри контейнера
  freshContainer.addEventListener("mousemove", (e) => {
    const nearestPointData = findNearestPoint(e.clientX, e.clientY, freshContainer);
    if (nearestPointData) {
      highlightPoint(nearestPointData.element, nearestPointData.model);
      updateSidebar(nearestPointData.model);
    }
  });

  // Обработчик выхода курсора из контейнера
  freshContainer.addEventListener("mouseleave", () => {
    highlightPoint(null, null);
    showDefaultModel();
  });

  // Показываем модель по умолчанию при инициализации (без лейблов)
  showDefaultModel();
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
