// Функция для парсинга стоимости из строки "$0.000930" -> 0.000930
function parseCost(costString) {
  if (typeof costString === 'number') return costString;
  return parseFloat(costString.toString().replace("$", ""));
}

// Функция для определения, нужно ли форматировать значение как валюту
function shouldFormatAsCurrency(config) {
  // Проверяем первую запись данных
  if (config.data && config.data.length > 0) {
    const firstValue = config.data[0].cost || config.data[0].parametersNumber;
    if (typeof firstValue === 'string' && firstValue.startsWith('$')) {
      return true;
    }
  }
  return false;
}

// Функция для форматирования значения оси X
function formatAxisXValue(value, config, decimals = 2, showUnit = true) {
  const isCurrency = shouldFormatAsCurrency(config);
  const formattedValue = value.toFixed(decimals);
  if (isCurrency && showUnit) {
    return "$" + formattedValue;
  }
  return formattedValue;
}

// Функция для получения количества знаков после запятой с учетом исключений
function getDecimals(config, axis, vendor = null) {
  const decimalsConfig = config[axis].hoverDecimals;
  if (typeof decimalsConfig === 'object' && decimalsConfig.exceptions) {
    return vendor && decimalsConfig.exceptions[vendor] !== undefined
      ? decimalsConfig.exceptions[vendor]
      : decimalsConfig.default;
  }
  return decimalsConfig;
}

// Функция для вычисления квадрата расстояния между двумя точками
function getDistanceSquared(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

// Функция для проверки, находится ли значение в массиве с учетом погрешности округления
function isValueInLabels(value, labels, epsilon = 0.0001) {
  if (labels.length === 0) return true;
  return labels.some(label => Math.abs(value - label) < epsilon);
}

// Функции для работы с типами точек и классами вендоров
const OUTLINED_VENDORS = [
  "OpenAI",
  "Google",
  "Whispeak",
  "Resemble AI",
  "Deep Learning & Media System Laboratory",
  "DF Arena ML Researchers",
  "Momenta",
  "Syntra",
  "Singapore Agency for Science, Technology & Research",
];

const GRAY_BORDER_VENDORS = [
  "Resemble AI",
  "Deep Learning & Media System Laboratory",
  "DF Arena ML Researchers",
  "Momenta",
  "Syntra",
  "Singapore Agency for Science, Technology & Research",
];

const MODULATE_GRADIENT_MODELS = [
  "velma-2-fast",
  "velma-2",
  "velma-1",
  "velma-2-heavy",
];

function getPointType(vendor) {
  return OUTLINED_VENDORS.includes(vendor) ? "outlined" : "filled";
}

function needsGrayBorder(vendor) {
  return GRAY_BORDER_VENDORS.includes(vendor);
}

function needsModulateGradient(vendor, model) {
  return vendor === "Modulate" && MODULATE_GRADIENT_MODELS.includes(model);
}

function normalizeVendorName(vendor) {
  return vendor
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\|\|/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Класс для создания scatter plot
class ScatterPlot {
  constructor(containerElement, config) {
    this.container = containerElement;
    this.config = config;
    this.pointsData = [];
    this.activePoint = null;
    this.axisScale = null;
    this.hoverRafId = null;
    this.latestMouseEvent = null;
    this.interactionsInitialized = false;
  }

  // Построение функций шкалы и общих параметров осей
  buildAxisScale() {
    const config = this.config;

    // Проверяем, есть ли разрыв оси
    const hasBreak = config.axisX.leftZone && config.axisX.rightZone && config.axisX.break;

    if (hasBreak) {
      const breakPoint = config.axisX.leftZone.max;
      const leftSectionEnd = config.axisX.break.leftSectionEnd;
      const rightSectionStart = config.axisX.break.rightSectionStart;

      return {
        breakPoint,
        leftSectionEnd,
        rightSectionStart,
        hasBreak: true,
        valueToX(value) {
          if (value <= breakPoint) {
            const normalized =
              (value - config.axisX.leftZone.min) /
              (config.axisX.leftZone.max - config.axisX.leftZone.min);
            return normalized * leftSectionEnd;
          }
          const normalized =
            (value - config.axisX.rightZone.min) /
            (config.axisX.rightZone.max - config.axisX.rightZone.min);
          return rightSectionStart + normalized * (100 - rightSectionStart);
        },
        valueToY(value) {
          // Для инвертированной оси: меньшее значение должно быть выше (y ближе к 0%)
          if (config.axisY.inverted) {
            // Инвертируем: большее значение score -> ниже на графике
            const normalized = (config.axisY.max - value) / (config.axisY.max - config.axisY.min);
            return (1 - normalized) * 100;
          } else {
            // Обычная ось: большее значение -> выше на графике
            const normalized = (value - config.axisY.min) / (config.axisY.max - config.axisY.min);
            return (1 - normalized) * 100;
          }
        },
      };
    } else {
      // Без разрыва оси
      return {
        hasBreak: false,
        valueToX(value) {
          const normalized =
            (value - config.axisX.min) / (config.axisX.max - config.axisX.min);
          return normalized * 100;
        },
        valueToY(value) {
          // Для инвертированной оси: меньшее значение должно быть выше (y ближе к 0%)
          if (config.axisY.inverted) {
            // Инвертируем: большее значение score -> ниже на графике
            const normalized = (config.axisY.max - value) / (config.axisY.max - config.axisY.min);
            return (1 - normalized) * 100;
          } else {
            // Обычная ось: большее значение -> выше на графике
            const normalized = (value - config.axisY.min) / (config.axisY.max - config.axisY.min);
            return (1 - normalized) * 100;
          }
        },
      };
    }
  }

  // Построение линий сетки на основе конфигурации
  createGridLines() {
    const container = this.container;
    const config = this.config;
    const scale = this.axisScale;

    // Линии сетки для оси Y
    const yGridConfig = config.axisY.gridLines;
    // Генерируем все значения с шагом step для рисования линий
    const yValues = [];
    // Определяем количество знаков после запятой для округления
    const decimals = yGridConfig.step.toString().split('.')[1]?.length || 0;
    for (let val = config.axisY.min + yGridConfig.step; val <= config.axisY.max; val += yGridConfig.step) {
      // Округляем значение, чтобы избежать погрешностей с плавающей точкой
      const roundedVal = Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
      yValues.push(roundedVal);
    }

    // Добавляем значения из labels, если они не попали в последовательность
    if (yGridConfig.labels.length > 0) {
      yGridConfig.labels.forEach(label => {
        if (label >= config.axisY.min && label <= config.axisY.max) {
          // Проверяем, нет ли уже такого значения в yValues (с учетом погрешности)
          const exists = yValues.some(val => Math.abs(val - label) < 0.0001);
          if (!exists) {
            yValues.push(label);
          }
        }
      });
      // Сортируем значения
      yValues.sort((a, b) => a - b);
    }

    // Определяем последнее значение, которое будет отображаться с подписью для оси Y
    const yLabelValues = yGridConfig.labels.length > 0
      ? yValues.filter(val => isValueInLabels(val, yGridConfig.labels))
      : yValues.filter(val => val <= config.axisY.max && val >= config.axisY.min);

    const yLastValue = yLabelValues.length > 0 ? yLabelValues[yLabelValues.length - 1] : null;
    const yFirstValue = yLabelValues.length > 0 ? yLabelValues[0] : null;
    // Для процентов показываем только у последнего, для других единиц - у первого и последнего
    const unit = config.axisY.unit || "";
    const isPercent = unit.includes("%");
    const showUnitsOnFirstAndLastY = config.axisY.showUnitsOnFirstAndLast !== undefined
      ? config.axisY.showUnitsOnFirstAndLast
      : !isPercent; // По умолчанию: проценты - только последний, иначе первый и последний

    yValues.forEach((score) => {
      if (score <= config.axisY.max && score >= config.axisY.min) {
        const y = scale.valueToY(score);

        // Засечка снаружи
        const tick = document.createElement("div");
        tick.className = "scatterplot-tick-y";
        tick.style.top = `${y}%`;
        container.appendChild(tick);

        // Горизонтальная линия сетки
        if (scale.hasBreak) {
          // С разрывом: две части
          const gridLineLeft = document.createElement("div");
          gridLineLeft.className = "scatterplot-grid-line-y scatterplot-grid-line-y-left";
          gridLineLeft.style.top = `${y}%`;
          container.appendChild(gridLineLeft);

          const gridLineRight = document.createElement("div");
          gridLineRight.className = "scatterplot-grid-line-y scatterplot-grid-line-y-right";
          gridLineRight.style.top = `${y}%`;
          container.appendChild(gridLineRight);
        } else {
          // Без разрыва: одна линия
          const gridLine = document.createElement("div");
          gridLine.className = "scatterplot-grid-line-y";
          gridLine.style.top = `${y}%`;
          gridLine.style.width = "100%";
          gridLine.style.left = "0";
          container.appendChild(gridLine);
        }

        // Подписи добавляем только для значений из labels (если указаны) или для всех (если labels пустой)
        const shouldAddLabel = isValueInLabels(score, yGridConfig.labels);
        if (shouldAddLabel) {
          const scoreLabel = document.createElement("div");
          scoreLabel.className = "scatterplot-static-label scatterplot-static-label-score";
          scoreLabel.style.top = `${y}%`;
          // Форматируем число с правильным количеством знаков после запятой
          const decimals = config.axisY.staticDecimals !== undefined ? config.axisY.staticDecimals : (yGridConfig.step.toString().split('.')[1]?.length || 0);
          const formattedValue = decimals === 0 ? Math.round(score).toString() : score.toFixed(decimals);
          const unit = config.axisY.unit || "";
          const showUnit = showUnitsOnFirstAndLastY
            ? (score === yFirstValue || score === yLastValue)
            : (score === yLastValue);
          scoreLabel.innerHTML = formattedValue + (showUnit ? unit : "");
          container.appendChild(scoreLabel);
        }
      }
    });

    // Линии сетки для оси X
    if (scale.hasBreak) {
      // С разрывом: левая и правая части
      const leftConfig = config.axisX.gridLines.left;
      const rightConfig = config.axisX.gridLines.right;

      // Левая часть
      // Генерируем все значения с шагом step для рисования линий
      const leftValues = [];
      for (let val = config.axisX.leftZone.min + leftConfig.step; val <= leftConfig.max; val += leftConfig.step) {
        leftValues.push(val);
      }

      // Добавляем значения из labels, если они не попали в последовательность
      if (leftConfig.labels.length > 0) {
        leftConfig.labels.forEach(label => {
          if (label >= config.axisX.leftZone.min && label <= leftConfig.max) {
            // Проверяем, нет ли уже такого значения в leftValues (с учетом погрешности)
            const exists = leftValues.some(val => Math.abs(val - label) < 0.0001);
            if (!exists) {
              leftValues.push(label);
            }
          }
        });
        // Сортируем значения
        leftValues.sort((a, b) => a - b);
      }

      // Определяем последнее значение, которое будет отображаться с подписью
      const leftLabelValues = leftConfig.labels.length > 0
        ? leftValues.filter(val => isValueInLabels(val, leftConfig.labels))
        : leftValues.filter(val => val <= leftConfig.max && val >= config.axisX.leftZone.min);

      const leftLastValue = config.axisX.leftZone.max;
      const leftFirstValue = leftLabelValues.length > 0 ? leftLabelValues[0] : null;
      // Для валюты показываем у первого и последнего, иначе только у последнего
      const isCurrency = shouldFormatAsCurrency(config);
      const showUnitsOnFirstAndLast = config.axisX.showUnitsOnFirstAndLast !== undefined
        ? config.axisX.showUnitsOnFirstAndLast
        : isCurrency; // По умолчанию: валюта - первый и последний, иначе только последний

      leftValues.forEach((cost) => {
        if (cost <= leftConfig.max && cost >= config.axisX.leftZone.min) {
          const x = scale.valueToX(cost);
          if (x < scale.leftSectionEnd) {
            const tick = document.createElement("div");
            tick.className = "scatterplot-tick-x";
            tick.style.left = `${x}%`;
            container.appendChild(tick);

            const gridLine = document.createElement("div");
            gridLine.className = "scatterplot-grid-line-x scatterplot-grid-line-x-left";
            gridLine.style.left = `${x}%`;
            container.appendChild(gridLine);

            // Подписи добавляем только для значений из labels (если указаны) или для всех (если labels пустой)
            const shouldAddLabel = isValueInLabels(cost, leftConfig.labels);
            if (shouldAddLabel) {
              const costLabel = document.createElement("div");
              costLabel.className = "scatterplot-static-label scatterplot-static-label-cost";
              costLabel.style.left = `${x}%`;
              const decimals = config.axisX.staticDecimals !== undefined ? config.axisX.staticDecimals : 2;
              const showUnit = showUnitsOnFirstAndLast
                ? (cost === leftFirstValue || cost === leftLastValue)
                : (cost === leftLastValue);
              costLabel.textContent = formatAxisXValue(cost, config, decimals, showUnit);
              container.appendChild(costLabel);
            }
          }
        }
      });

      // Подпись для крайнего правого значения первой зоны
      const leftZoneMaxX = scale.valueToX(config.axisX.leftZone.max);
      const leftZoneMaxLabel = document.createElement("div");
      leftZoneMaxLabel.className = "scatterplot-static-label scatterplot-static-label-cost";
      leftZoneMaxLabel.style.left = `${leftZoneMaxX}%`;
      const decimals = config.axisX.staticDecimals !== undefined ? config.axisX.staticDecimals : 2;
      const showUnitLeftMax = showUnitsOnFirstAndLast
        ? (config.axisX.leftZone.max === leftFirstValue || config.axisX.leftZone.max === leftLastValue)
        : (config.axisX.leftZone.max === leftLastValue);
      leftZoneMaxLabel.textContent = formatAxisXValue(config.axisX.leftZone.max, config, decimals, showUnitLeftMax);
      container.appendChild(leftZoneMaxLabel);

      // Правая часть
      // Генерируем все значения с шагом step от нуля (как будто линии были от нуля)
      const rightValues = [];
      for (let val = rightConfig.step; val <= rightConfig.max; val += rightConfig.step) {
        // Добавляем только те значения, которые попадают в диапазон правой зоны
        if (val >= config.axisX.rightZone.min && val <= rightConfig.max) {
          rightValues.push(val);
        }
      }

      // Добавляем значения из labels, если они не попали в последовательность
      if (rightConfig.labels.length > 0) {
        rightConfig.labels.forEach(label => {
          if (label >= config.axisX.rightZone.min && label <= rightConfig.max) {
            // Проверяем, нет ли уже такого значения в rightValues (с учетом погрешности)
            const exists = rightValues.some(val => Math.abs(val - label) < 0.0001);
            if (!exists) {
              rightValues.push(label);
            }
          }
        });
        // Сортируем значения
        rightValues.sort((a, b) => a - b);
      }

      // Определяем последнее значение, которое будет отображаться с подписью для правой части
      const rightLabelValues = rightConfig.labels.length > 0
        ? rightValues.filter(val => isValueInLabels(val, rightConfig.labels))
        : rightValues.filter(val => val <= rightConfig.max && val >= config.axisX.rightZone.min);

      const rightLastValue = rightLabelValues.length > 0 ? rightLabelValues[rightLabelValues.length - 1] : null;
      const rightFirstValue = rightLabelValues.length > 0 ? rightLabelValues[0] : null;

      rightValues.forEach((cost) => {
        if (cost <= rightConfig.max && cost >= config.axisX.rightZone.min) {
          const x = scale.valueToX(cost);
          if (x >= scale.rightSectionStart) {
            const tick = document.createElement("div");
            tick.className = "scatterplot-tick-x";
            tick.style.left = `${x}%`;
            container.appendChild(tick);

            const gridLine = document.createElement("div");
            gridLine.className = "scatterplot-grid-line-x scatterplot-grid-line-x-right";
            gridLine.style.left = `${x}%`;
            container.appendChild(gridLine);

            // Подписи добавляем только для значений из labels (если указаны) или для всех (если labels пустой)
            const shouldAddLabel = isValueInLabels(cost, rightConfig.labels);
            if (shouldAddLabel) {
              const costLabel = document.createElement("div");
              costLabel.className = "scatterplot-static-label scatterplot-static-label-cost";
              costLabel.style.left = `${x}%`;
              const decimals = config.axisX.staticDecimals !== undefined ? config.axisX.staticDecimals : 2;
              const showUnit = showUnitsOnFirstAndLast
                ? (cost === rightFirstValue || cost === rightLastValue)
                : (cost === rightLastValue);
              costLabel.textContent = formatAxisXValue(cost, config, decimals, showUnit);
              container.appendChild(costLabel);
            }
          }
        }
      });

      // Вычисляем фактическую ширину правой секции
      const maxCostXForWidth = scale.valueToX(config.axisX.rightZone.max);
      const rightSectionActualWidth = maxCostXForWidth - scale.rightSectionStart;
      container.style.setProperty('--right-section-width', `${rightSectionActualWidth}%`);
    } else {
      // Без разрыва: единые настройки
      const xGridConfig = config.axisX.gridLines;
      // Генерируем все значения с шагом step для рисования линий
      const xValues = [];
      for (let val = config.axisX.min + xGridConfig.step; val <= config.axisX.max; val += xGridConfig.step) {
        xValues.push(val);
      }

      // Добавляем значения из labels, если они не попали в последовательность
      if (xGridConfig.labels.length > 0) {
        xGridConfig.labels.forEach(label => {
          if (label >= config.axisX.min && label <= config.axisX.max) {
            // Проверяем, нет ли уже такого значения в xValues (с учетом погрешности)
            const exists = xValues.some(val => Math.abs(val - label) < 0.0001);
            if (!exists) {
              xValues.push(label);
            }
          }
        });
        // Сортируем значения
        xValues.sort((a, b) => a - b);
      }

      // Определяем последнее значение, которое будет отображаться с подписью
      const xLabelValues = xGridConfig.labels.length > 0
        ? xValues.filter(val => isValueInLabels(val, xGridConfig.labels))
        : xValues.filter(val => val <= config.axisX.max && val >= config.axisX.min);

      const xLastValue = xLabelValues.length > 0 ? xLabelValues[xLabelValues.length - 1] : null;
      const xFirstValue = xLabelValues.length > 0 ? xLabelValues[0] : null;
      // Для валюты показываем у первого и последнего, иначе только у последнего
      const isCurrencyX = shouldFormatAsCurrency(config);
      const showUnitsOnFirstAndLastX = config.axisX.showUnitsOnFirstAndLast !== undefined
        ? config.axisX.showUnitsOnFirstAndLast
        : isCurrencyX; // По умолчанию: валюта - первый и последний, иначе только последний

      xValues.forEach((cost) => {
        if (cost <= config.axisX.max && cost >= config.axisX.min) {
          const x = scale.valueToX(cost);

          const tick = document.createElement("div");
          tick.className = "scatterplot-tick-x";
          tick.style.left = `${x}%`;
          container.appendChild(tick);

          const gridLine = document.createElement("div");
          gridLine.className = "scatterplot-grid-line-x";
          gridLine.style.left = `${x}%`;
          container.appendChild(gridLine);

          // Подписи добавляем только для значений из labels (если указаны) или для всех (если labels пустой)
          const shouldAddLabel = isValueInLabels(cost, xGridConfig.labels);
          if (shouldAddLabel) {
            const costLabel = document.createElement("div");
            costLabel.className = "scatterplot-static-label scatterplot-static-label-cost";
            costLabel.style.left = `${x}%`;
            // Форматируем в зависимости от значения
            const decimals = config.axisX.staticDecimals !== undefined ? config.axisX.staticDecimals : (cost < 1 ? 2 : 0);
            const showUnit = showUnitsOnFirstAndLastX
              ? (cost === xFirstValue || cost === xLastValue)
              : (cost === xLastValue);
            costLabel.textContent = formatAxisXValue(cost, config, decimals, showUnit);
            container.appendChild(costLabel);
          }
        }
      });
    }

    // Ноль (0) на оси X
    const zeroLabel = document.createElement("div");
    zeroLabel.className = "scatterplot-static-label scatterplot-static-label-zero";
    zeroLabel.textContent = "0";
    container.appendChild(zeroLabel);
  }

  // Поиск ближайшей точки к курсору
  findNearestPoint(mouseX, mouseY) {
    const rect = this.container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const mouseXPercent = ((mouseX - rect.left) / containerWidth) * 100;
    const mouseYPercent = ((mouseY - rect.top) / containerHeight) * 100;

    let nearestPoint = null;
    let minDistance = Infinity;

    this.pointsData.forEach((pointData) => {
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

  // Подсветка точки
  highlightPoint(pointElement, modelData) {
    const container = this.container;
    if (!container) return;

    const costLabel = container.querySelector(".scatterplot-axis-x-label");
    const scoreLabel = container.querySelector(".scatterplot-axis-y-label");
    const costLabelTick = container.querySelector(".scatterplot-axis-x-tick");
    const scoreLabelTick = container.querySelector(".scatterplot-axis-y-tick");

    // Убираем подсветку с предыдущей точки
    if (this.activePoint && this.activePoint.element) {
      this.activePoint.element.classList.remove("scatterplot-point-active");
      if (this.activePoint.label) {
        this.activePoint.label.classList.remove("scatterplot-point-label-active");
      }
    }

    // Подсвечиваем новую точку и обновляем лейблы
    if (pointElement && modelData) {
      pointElement.classList.add("scatterplot-point-active");
      const pointData = this.pointsData.find(p => p.element === pointElement);
      if (pointData && pointData.label) {
        pointData.label.classList.add("scatterplot-point-label-active");
      }
      this.activePoint = { element: pointElement, label: pointData?.label, model: modelData };

      const costValue = modelData.cost || modelData.parametersNumber;
      const cost = parseCost(costValue);
      const x = this.axisScale.valueToX(cost);
      const displayScore = this.config.useVisualOffset && modelData.visualOffset !== undefined
        ? modelData.score + modelData.visualOffset
        : modelData.score;
      const y = this.axisScale.valueToY(displayScore);

      // Обновляем лейбл цены и его засечку
      if (costLabel) {
        costLabel.style.left = `${x}%`;
        const decimals = getDecimals(this.config, 'axisX', modelData.vendor);
        costLabel.textContent = formatAxisXValue(cost, this.config, decimals);
        costLabel.style.display = "block";
      }
      if (costLabelTick) {
        costLabelTick.style.left = `${x}%`;
        costLabelTick.style.display = "block";
      }

      // Обновляем лейбл оценки и его засечку
      if (scoreLabel) {
        scoreLabel.style.top = `${y}%`;
        const decimals = getDecimals(this.config, 'axisY', modelData.vendor);
        const formattedValue = modelData.score.toFixed(decimals);
        const unit = this.config.axisY.unit || "";
        scoreLabel.innerHTML = formattedValue + (unit ? unit : "");
        scoreLabel.style.display = "block";
      }
      if (scoreLabelTick) {
        scoreLabelTick.style.top = `${y}%`;
        scoreLabelTick.style.display = "block";
      }
    } else {
      // Убираем активное состояние с точки и лейбла
      if (this.activePoint && this.activePoint.element) {
        this.activePoint.element.classList.remove("scatterplot-point-active");
        if (this.activePoint.label) {
          this.activePoint.label.classList.remove("scatterplot-point-label-active");
        }
      }
      this.activePoint = null;
      // Скрываем лейблы и засечки
      if (costLabel) costLabel.style.display = "none";
      if (scoreLabel) scoreLabel.style.display = "none";
      if (costLabelTick) costLabelTick.style.display = "none";
      if (scoreLabelTick) scoreLabelTick.style.display = "none";
    }
  }

  // Инициализация взаимодействий
  initInteractions() {
    if (!this.container || this.interactionsInitialized) return;

    const handleMove = (e) => {
      this.latestMouseEvent = e;
      if (this.hoverRafId) return;
      this.hoverRafId = requestAnimationFrame(() => {
        this.hoverRafId = null;
        if (!this.latestMouseEvent || !this.container) return;
        const nearestPointData = this.findNearestPoint(
          this.latestMouseEvent.clientX,
          this.latestMouseEvent.clientY
        );
        if (nearestPointData) {
          this.highlightPoint(nearestPointData.element, nearestPointData.model);
        }
      });
    };

    const handleLeave = () => {
      this.latestMouseEvent = null;
      if (this.hoverRafId) {
        cancelAnimationFrame(this.hoverRafId);
        this.hoverRafId = null;
      }
      this.highlightPoint(null, null);
    };

    this.container.addEventListener("mousemove", handleMove);
    this.container.addEventListener("mouseleave", handleLeave);
    this.interactionsInitialized = true;
  }

  // Создание scatter plot
  createScatterPlot() {
    const container = this.container;
    if (!container) {
      console.error("Контейнер не найден для создания графика");
      return;
    }

    const config = this.config;
    if (!config || !config.data) {
      console.error("Конфигурация или данные отсутствуют:", config);
      return;
    }

    this.axisScale = this.buildAxisScale();
    if (!this.axisScale) {
      console.error("Не удалось построить шкалу осей");
      return;
    }

    this.initInteractions();

    // Сохраняем подписи осей и background highlight перед очисткой
    const axisLabelX = container.querySelector(".scatterplot-axis-label-x");
    const axisLabelY = container.querySelector(".scatterplot-axis-label-y");
    const backgroundHighlight = container.querySelector(".scatterplot-background-highlight");

    // Клонируем элементы перед очисткой, чтобы сохранить их структуру
    const axisLabelXClone = axisLabelX ? axisLabelX.cloneNode(true) : null;
    const axisLabelYClone = axisLabelY ? axisLabelY.cloneNode(true) : null;
    const backgroundHighlightClone = backgroundHighlight ? backgroundHighlight.cloneNode(true) : null;

    // Очищаем контейнер и данные
    container.innerHTML = "";
    this.pointsData = [];
    this.activePoint = null;

    // Восстанавливаем background highlight
    if (backgroundHighlightClone) {
      // Обновляем текст подписи из конфигурации, если указан
      if (config.backgroundHighlight && config.backgroundHighlight.text) {
        const labelElement = backgroundHighlightClone.querySelector(".scatterplot-background-highlight-label");
        if (labelElement) {
          labelElement.textContent = config.backgroundHighlight.text;
        }
      }
      container.appendChild(backgroundHighlightClone);
    }

    // Восстанавливаем подписи осей
    if (axisLabelXClone) {
      container.appendChild(axisLabelXClone);
    }
    if (axisLabelYClone) {
      container.appendChild(axisLabelYClone);
    }

    const scale = this.axisScale;

    // Устанавливаем CSS переменные для горизонтальных линий сетки (если есть разрыв)
    if (scale.hasBreak) {
      container.style.setProperty('--left-section-end', `${scale.leftSectionEnd}%`);
      container.style.setProperty('--right-section-start', `${scale.rightSectionStart}%`);
    }

    // Рисуем точки
    if (!config.data || config.data.length === 0) {
      console.warn("Нет данных для отображения");
      return;
    }

    // Находим максимальное значение по оси X для определения крайних точек справа
    let maxXValue = -Infinity;
    config.data.forEach((model) => {
      const costValue = model.cost || model.parametersNumber;
      const cost = parseCost(costValue);
      if (cost > maxXValue) {
        maxXValue = cost;
      }
    });

    config.data.forEach((model) => {
      const costValue = model.cost || model.parametersNumber;
      const cost = parseCost(costValue);
      const x = scale.valueToX(cost);
      const displayScore = config.useVisualOffset && model.visualOffset !== undefined
        ? model.score + model.visualOffset
        : model.score;
      const y = scale.valueToY(displayScore);

      if (isNaN(x) || isNaN(y)) {
        console.warn("Некорректные координаты для точки:", { model, x, y, cost, displayScore });
        return;
      }

      const point = document.createElement("div");
      const vendorClass = `vendor-${normalizeVendorName(model.vendor)}`;
      const pointType = getPointType(model.vendor);
      point.className = `scatterplot-point ${vendorClass} ${pointType}`;

      if (needsGrayBorder(model.vendor)) {
        point.classList.add("vendor-gray-border");
      }
      if (needsModulateGradient(model.vendor, model.model)) {
        point.classList.add("vendor-modulate-gradient");
      }

      point.style.left = `${x}%`;
      point.style.top = `${y}%`;
      point.dataset.vendor = model.vendor;
      point.dataset.model = model.model;
      point.dataset.modelType = model.modelType || "";
      point.dataset.score = model.score;
      const isCurrency = shouldFormatAsCurrency(config);
      point.dataset.cost = typeof costValue === 'string' ? costValue : (isCurrency ? "$" + cost.toFixed(2) : cost.toFixed(2));
      if (model.speed !== undefined) {
        point.dataset.speed = model.speed;
      }

      // Создаем подпись названия модели
      const modelLabel = document.createElement("div");
      modelLabel.className = "scatterplot-point-label";
      // Для gpt-5.2 и gpt-5.2-pro подпись слева
      if (model.model === "gpt-5.2" || model.model === "gpt-5.2-pro") {
        modelLabel.classList.add("scatterplot-point-label-left");
      }
      // Для крайних точек справа (в последних 5% диапазона) подпись слева
      const threshold = maxXValue * 0.95;
      if (cost >= threshold) {
        modelLabel.classList.add("scatterplot-point-label-left");
      }
      modelLabel.textContent = model.model;
      modelLabel.dataset.vendor = model.vendor;
      modelLabel.style.left = `${x}%`;
      modelLabel.style.top = `${y}%`;
      container.appendChild(modelLabel);

      // Сохраняем данные точки
      this.pointsData.push({
        element: point,
        label: modelLabel,
        model: model,
        xPercent: x,
        yPercent: y,
      });

      container.appendChild(point);
    });

    // Создаем линии сетки
    this.createGridLines();

    // Создаем динамические лейблы для активной точки
    const costLabel = document.createElement("div");
    costLabel.className = "scatterplot-axis-x-label";
    costLabel.style.display = "none";
    container.appendChild(costLabel);

    const scoreLabel = document.createElement("div");
    scoreLabel.className = "scatterplot-axis-y-label";
    scoreLabel.style.display = "none";
    container.appendChild(scoreLabel);

    // Создаем засечки и линии для лейблов активной точки
    const costLabelTick = document.createElement("div");
    costLabelTick.className = "scatterplot-axis-x-tick";
    costLabelTick.style.display = "none";
    container.appendChild(costLabelTick);

    const scoreLabelTick = document.createElement("div");
    scoreLabelTick.className = "scatterplot-axis-y-tick";
    scoreLabelTick.style.display = "none";
    container.appendChild(scoreLabelTick);

    // Создаем визуальный элемент разрыва оси (если есть)
    if (scale.hasBreak) {
      const GAP_SIZE = scale.rightSectionStart - scale.leftSectionEnd;

      const axisBreakLeft = document.createElement("div");
      axisBreakLeft.className = "scatterplot-axis-break scatterplot-axis-break-left";
      axisBreakLeft.style.left = `${scale.leftSectionEnd}%`;
      axisBreakLeft.style.width = `${GAP_SIZE}%`;
      container.appendChild(axisBreakLeft);

      const axisBreakRight = document.createElement("div");
      axisBreakRight.className = "scatterplot-axis-break scatterplot-axis-break-right";
      axisBreakRight.style.left = `${scale.rightSectionStart}%`;
      axisBreakRight.style.width = `${GAP_SIZE}%`;
      container.appendChild(axisBreakRight);
    }
  }
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM загружен, начинаем инициализацию графиков");

  // Проверяем наличие конфигураций
  if (typeof scatterPlotConfig1 === 'undefined' ||
    typeof scatterPlotConfig2 === 'undefined' ||
    typeof scatterPlotConfig3 === 'undefined') {
    console.error("Конфигурации не загружены. Убедитесь, что все config-*.js файлы подключены перед script.js");
    return;
  }

  // Находим контейнеры
  const container1 = document.querySelector("#scatterplot-1 .scatterplot-aria");
  const container2 = document.querySelector("#scatterplot-2 .scatterplot-aria");
  const container3 = document.querySelector("#scatterplot-3 .scatterplot-aria");

  if (!container1 || !container2 || !container3) {
    console.error("Не найдены контейнеры для графиков:", { container1, container2, container3 });
    return;
  }

  // Создаем три инстанса ScatterPlot
  const plot1 = new ScatterPlot(container1, scatterPlotConfig1);
  plot1.createScatterPlot();

  const plot2 = new ScatterPlot(container2, scatterPlotConfig2);
  plot2.createScatterPlot();

  const plot3 = new ScatterPlot(container3, scatterPlotConfig3);
  plot3.createScatterPlot();

  // Создаем легенду вендоров для конкретного графика
  function createVendorsLegend(containerSelector, config, customOrder) {
    const vendorsContainer = document.querySelector(containerSelector);
    if (!vendorsContainer || !config || !config.data) return;

    // Собираем уникальные вендоры из данных этого графика
    const vendorsSet = new Set();
    config.data.forEach((item) => {
      vendorsSet.add(item.vendor);
    });

    // Сортируем вендоры: используем customOrder если предоставлен, иначе по умолчанию
    const vendorsArray = Array.from(vendorsSet);
    let vendors;
    if (customOrder && Array.isArray(customOrder)) {
      // Используем кастомный порядок
      vendors = customOrder.filter(vendor => vendorsSet.has(vendor));
      // Добавляем любые вендоры, которые не были в списке customOrder
      vendorsArray.forEach(vendor => {
        if (!vendors.includes(vendor)) {
          vendors.push(vendor);
        }
      });
    } else {
      // Сортируем вендоры: сначала Modulate, потом остальные по алфавиту
      vendors = vendorsArray.sort((a, b) => {
        if (a === "Modulate") return -1;
        if (b === "Modulate") return 1;
        return a.localeCompare(b);
      });
    }

    // Создаем элементы для каждого вендора
    vendors.forEach((vendor) => {
      const vendorItem = document.createElement("div");
      vendorItem.className = "vendor-item";

      const point = document.createElement("div");
      const vendorClass = `vendor-${normalizeVendorName(vendor)}`;
      const pointType = getPointType(vendor);
      point.className = `scatterplot-point ${vendorClass} ${pointType}`;

      if (vendor === "Modulate") {
        point.classList.add("vendor-modulate-gradient");
      }

      if (needsGrayBorder(vendor)) {
        point.classList.add("vendor-gray-border");
      }

      const label = document.createElement("span");
      label.className = "vendor-label";
      label.textContent = vendor;

      vendorItem.appendChild(point);
      vendorItem.appendChild(label);
      vendorsContainer.appendChild(vendorItem);
    });
  }

  // Создаем легенды для каждого графика
  // Scatter plot 1: Modulate, xAI, Google, DeepSeek, OpenAI
  createVendorsLegend("#scatterplot-1 .vendors", scatterPlotConfig1, [
    "Modulate", "xAI", "Google", "DeepSeek", "OpenAI"
  ]);
  // Scatter plot 2: Modulate, NVIDIA, Mistral, Google, AssemblyAI, Deepgram, Gladia, Speechmatics, ElevenLabs, OpenAI, Microsoft, Amazon
  createVendorsLegend("#scatterplot-2 .vendors", scatterPlotConfig2, [
    "Modulate", "NVIDIA", "Mistral", "Google", "AssemblyAI", "Deepgram", "Gladia", "Speechmatics", "ElevenLabs", "OpenAI", "Microsoft", "Amazon"
  ]);
  createVendorsLegend("#scatterplot-3 .vendors", scatterPlotConfig3);

  // Управление размером всех графиков
  const widthControl = document.getElementById("width-control");
  const heightControl = document.getElementById("height-control");
  const labelFontSizeControl = document.getElementById("label-font-size-control");
  const pointSizeControl = document.getElementById("point-size-control");
  const axisFontSizeControl = document.getElementById("axis-font-size-control");

  const scatterplotWrappers = [
    document.querySelector("#scatterplot-1"),
    document.querySelector("#scatterplot-2"),
    document.querySelector("#scatterplot-3"),
  ];
  const scatterplotArias = [
    document.querySelector("#scatterplot-1 .scatterplot-aria"),
    document.querySelector("#scatterplot-2 .scatterplot-aria"),
    document.querySelector("#scatterplot-3 .scatterplot-aria"),
  ];
  const root = document.documentElement;

  // Функция для перерисовки всех графиков
  const redrawAllPlots = () => {
    plot1.createScatterPlot();
    plot2.createScatterPlot();
    plot3.createScatterPlot();
  };

  // Универсальная функция для создания обработчика контролов с дебаунсингом
  function createDebouncedControlHandler({
    parseValue,
    validateValue,
    applyValue,
    getMinMax,
    redrawCallback,
  }) {
    let timeoutId = null;

    return {
      onInput: (e) => {
        // Очищаем предыдущий таймаут
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const input = e.target;
        const rawValue = input.value;
        const parsed = parseValue(rawValue);
        const { min, max } = getMinMax(input);

        // Убираем класс invalid при вводе
        input.classList.remove("invalid");

        // Устанавливаем таймаут для применения значения
        timeoutId = setTimeout(() => {
          if (validateValue(parsed, min, max)) {
            applyValue(parsed, input);
            redrawCallback();
          } else {
            // Значение невалидно - красим красным
            input.classList.add("invalid");
          }
        }, 500); // 500ms дебаунсинг
      },

      onChange: (e) => {
        // Для события change (стрелки) применяем мгновенно
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        const input = e.target;
        const rawValue = input.value;
        const parsed = parseValue(rawValue);
        const { min, max } = getMinMax(input);

        input.classList.remove("invalid");

        if (validateValue(parsed, min, max)) {
          applyValue(parsed, input);
          redrawCallback();
        } else {
          input.classList.add("invalid");
        }
      },
    };
  }

  if (widthControl && heightControl && scatterplotWrappers[0] && scatterplotArias[0]) {

    // Обработчик для ширины
    const widthHandler = createDebouncedControlHandler({
      parseValue: (val) => parseFloat(val),
      validateValue: (val, min, max) => !isNaN(val) && val >= min,
      applyValue: (val, input) => {
        const min = parseFloat(input.min) || 100;
        const finalValue = Math.max(min, val);
        input.value = finalValue;
        scatterplotWrappers.forEach((wrapper) => {
          if (wrapper) wrapper.style.width = `${finalValue}px`;
        });
      },
      getMinMax: (input) => ({ min: parseFloat(input.min) || 100, max: Infinity }),
      redrawCallback: redrawAllPlots,
    });
    widthControl.addEventListener("input", widthHandler.onInput);
    widthControl.addEventListener("change", widthHandler.onChange);

    // Обработчик для высоты
    const heightHandler = createDebouncedControlHandler({
      parseValue: (val) => parseFloat(val),
      validateValue: (val, min, max) => !isNaN(val) && val >= min,
      applyValue: (val, input) => {
        const min = parseFloat(input.min) || 100;
        const finalValue = Math.max(min, val);
        input.value = finalValue;
        scatterplotArias.forEach((aria) => {
          if (aria) aria.style.height = `${finalValue}px`;
        });
      },
      getMinMax: (input) => ({ min: parseFloat(input.min) || 100, max: Infinity }),
      redrawCallback: redrawAllPlots,
    });
    heightControl.addEventListener("input", heightHandler.onInput);
    heightControl.addEventListener("change", heightHandler.onChange);

    // Обработчик для размера текста лейблов
    if (labelFontSizeControl) {
      const labelFontSizeHandler = createDebouncedControlHandler({
        parseValue: (val) => parseFloat(val),
        validateValue: (val, min, max) => !isNaN(val) && val >= min && val <= max,
        applyValue: (val, input) => {
          const min = parseFloat(input.min) || 8;
          const max = parseFloat(input.max) || 24;
          const finalValue = Math.max(min, Math.min(max, val));
          input.value = Math.round(finalValue);
          root.style.setProperty("--scatterplot-label-font-size", `${Math.round(finalValue)}px`);
        },
        getMinMax: (input) => ({ min: parseFloat(input.min) || 8, max: parseFloat(input.max) || 24 }),
        redrawCallback: redrawAllPlots,
      });
      labelFontSizeControl.addEventListener("input", labelFontSizeHandler.onInput);
      labelFontSizeControl.addEventListener("change", labelFontSizeHandler.onChange);
    }

    // Обработчик для размера точек
    if (pointSizeControl) {
      const pointSizeHandler = createDebouncedControlHandler({
        parseValue: (val) => parseFloat(val),
        validateValue: (val, min, max) => !isNaN(val) && val >= min && val <= max,
        applyValue: (val, input) => {
          const min = parseFloat(input.min) || 4;
          const max = parseFloat(input.max) || 32;
          const finalValue = Math.max(min, Math.min(max, val));
          input.value = finalValue;
          root.style.setProperty("--scatterplot-point-size", `${finalValue}px`);
        },
        getMinMax: (input) => ({ min: parseFloat(input.min) || 4, max: parseFloat(input.max) || 32 }),
        redrawCallback: redrawAllPlots,
      });
      pointSizeControl.addEventListener("input", pointSizeHandler.onInput);
      pointSizeControl.addEventListener("change", pointSizeHandler.onChange);
    }

    // Обработчик для размера подписей на осях
    if (axisFontSizeControl) {
      const axisFontSizeHandler = createDebouncedControlHandler({
        parseValue: (val) => parseFloat(val),
        validateValue: (val, min, max) => !isNaN(val) && val >= min && val <= max,
        applyValue: (val, input) => {
          const min = parseFloat(input.min) || 8;
          const max = parseFloat(input.max) || 24;
          const finalValue = Math.max(min, Math.min(max, val));
          input.value = Math.round(finalValue);
          root.style.setProperty("--scatterplot-axis-font-size", `${Math.round(finalValue)}px`);
        },
        getMinMax: (input) => ({ min: parseFloat(input.min) || 8, max: parseFloat(input.max) || 24 }),
        redrawCallback: redrawAllPlots,
      });
      axisFontSizeControl.addEventListener("input", axisFontSizeHandler.onInput);
      axisFontSizeControl.addEventListener("change", axisFontSizeHandler.onChange);
    }

    // Инициализация значений по умолчанию
    scatterplotWrappers.forEach((wrapper) => {
      if (wrapper) wrapper.style.width = "1140px";
    });
    scatterplotArias.forEach((aria) => {
      if (aria) aria.style.height = "400px";
    });
  }

  // Перерисовка при изменении размера окна
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      plot1.createScatterPlot();
      plot2.createScatterPlot();
      plot3.createScatterPlot();
    }, 100);
  });
});
