// Function to parse cost from string "$0.000930" -> 0.000930
function parseCost(costString) {
  if (typeof costString === 'number') return costString;
  return parseFloat(costString.toString().replace("$", ""));
}

// Function to determine if value should be formatted as currency
function shouldFormatAsCurrency(config) {
  // Check the first data entry
  if (config.data && config.data.length > 0) {
    const firstValue = config.data[0].cost || config.data[0].parametersNumber;
    if (typeof firstValue === 'string' && firstValue.startsWith('$')) {
      return true;
    }
  }
  return false;
}

// Function to format X axis value
function formatAxisXValue(value, config, decimals = 2, showUnit = true) {
  const isCurrency = shouldFormatAsCurrency(config);
  const formattedValue = value.toFixed(decimals);
  if (isCurrency && showUnit) {
    return "$" + formattedValue;
  }
  return formattedValue;
}

// Function to get number of decimal places with exceptions
function getDecimals(config, axis, vendor = null) {
  const decimalsConfig = config[axis].hoverDecimals;
  if (typeof decimalsConfig === 'object' && decimalsConfig.exceptions) {
    return vendor && decimalsConfig.exceptions[vendor] !== undefined
      ? decimalsConfig.exceptions[vendor]
      : decimalsConfig.default;
  }
  return decimalsConfig;
}

// Function to calculate squared distance between two points
function getDistanceSquared(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

// Function to check if value is in array considering rounding tolerance
function isValueInLabels(value, labels, epsilon = 0.0001) {
  if (labels.length === 0) return true;
  return labels.some(label => Math.abs(value - label) < epsilon);
}

// Functions for working with point types and vendor classes
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

// Class for creating scatter plot
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

  // Build scale functions and common axis parameters
  buildAxisScale() {
    const config = this.config;

    // Check if axis has a break
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
          // For inverted axis: smaller value should be higher (y closer to 0%)
          if (config.axisY.inverted) {
            // Invert: larger score value -> lower on chart
            const normalized = (config.axisY.max - value) / (config.axisY.max - config.axisY.min);
            return (1 - normalized) * 100;
          } else {
            // Normal axis: larger value -> higher on chart
            const normalized = (value - config.axisY.min) / (config.axisY.max - config.axisY.min);
            return (1 - normalized) * 100;
          }
        },
      };
    } else {
      // Without axis break
      return {
        hasBreak: false,
        valueToX(value) {
          const normalized =
            (value - config.axisX.min) / (config.axisX.max - config.axisX.min);
          return normalized * 100;
        },
        valueToY(value) {
          // For inverted axis: smaller value should be higher (y closer to 0%)
          if (config.axisY.inverted) {
            // Invert: larger score value -> lower on chart
            const normalized = (config.axisY.max - value) / (config.axisY.max - config.axisY.min);
            return (1 - normalized) * 100;
          } else {
            // Normal axis: larger value -> higher on chart
            const normalized = (value - config.axisY.min) / (config.axisY.max - config.axisY.min);
            return (1 - normalized) * 100;
          }
        },
      };
    }
  }

  // Build grid lines based on configuration
  createGridLines() {
    const container = this.container;
    const config = this.config;
    const scale = this.axisScale;

    // Grid lines for Y axis
    const yGridConfig = config.axisY.gridLines;
    // Generate all values with step interval for drawing lines
    const yValues = [];
    // Determine number of decimal places for rounding
    const decimals = yGridConfig.step.toString().split('.')[1]?.length || 0;
    for (let val = config.axisY.min + yGridConfig.step; val <= config.axisY.max; val += yGridConfig.step) {
      // Round value to avoid floating point errors
      const roundedVal = Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
      yValues.push(roundedVal);
    }

    // Add values from labels if they didn't fall into the sequence
    if (yGridConfig.labels.length > 0) {
      yGridConfig.labels.forEach(label => {
        if (label >= config.axisY.min && label <= config.axisY.max) {
          // Check if value already exists in yValues (with tolerance)
          const exists = yValues.some(val => Math.abs(val - label) < 0.0001);
          if (!exists) {
            yValues.push(label);
          }
        }
      });
      // Sort values
      yValues.sort((a, b) => a - b);
    }

    // Determine the last value that will be displayed with a label for Y axis
    const yLabelValues = yGridConfig.labels.length > 0
      ? yValues.filter(val => isValueInLabels(val, yGridConfig.labels))
      : yValues.filter(val => val <= config.axisY.max && val >= config.axisY.min);

    const yLastValue = yLabelValues.length > 0 ? yLabelValues[yLabelValues.length - 1] : null;
    const yFirstValue = yLabelValues.length > 0 ? yLabelValues[0] : null;
    // For percentages show only on last, for other units - on first and last
    const unit = config.axisY.unit || "";
    const isPercent = unit.includes("%");
    const showUnitsOnFirstAndLastY = config.axisY.showUnitsOnFirstAndLast !== undefined
      ? config.axisY.showUnitsOnFirstAndLast
      : !isPercent; // Default: percentages - only last, otherwise first and last

    yValues.forEach((score) => {
      if (score <= config.axisY.max && score >= config.axisY.min) {
        const y = scale.valueToY(score);

        // External tick mark
        const tick = document.createElement("div");
        tick.className = "scatterplot-tick-y";
        tick.style.top = `${y}%`;
        container.appendChild(tick);

        // Horizontal grid line
        if (scale.hasBreak) {
          // With break: two parts
          const gridLineLeft = document.createElement("div");
          gridLineLeft.className = "scatterplot-grid-line-y scatterplot-grid-line-y-left";
          gridLineLeft.style.top = `${y}%`;
          container.appendChild(gridLineLeft);

          const gridLineRight = document.createElement("div");
          gridLineRight.className = "scatterplot-grid-line-y scatterplot-grid-line-y-right";
          gridLineRight.style.top = `${y}%`;
          container.appendChild(gridLineRight);
        } else {
          // Without break: single line
          const gridLine = document.createElement("div");
          gridLine.className = "scatterplot-grid-line-y";
          gridLine.style.top = `${y}%`;
          gridLine.style.width = "100%";
          gridLine.style.left = "0";
          container.appendChild(gridLine);
        }

        // Add labels only for values from labels (if specified) or for all (if labels is empty)
        const shouldAddLabel = isValueInLabels(score, yGridConfig.labels);
        if (shouldAddLabel) {
          const scoreLabel = document.createElement("div");
          scoreLabel.className = "scatterplot-static-label scatterplot-static-label-score";
          scoreLabel.style.top = `${y}%`;
          // Format number with correct number of decimal places
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

    // Grid lines for X axis
    if (scale.hasBreak) {
      // With break: left and right parts
      const leftConfig = config.axisX.gridLines.left;
      const rightConfig = config.axisX.gridLines.right;

      // Left part
      // Generate all values with step interval for drawing lines
      const leftValues = [];
      for (let val = config.axisX.leftZone.min + leftConfig.step; val <= leftConfig.max; val += leftConfig.step) {
        leftValues.push(val);
      }

      // Add values from labels if they didn't fall into the sequence
      if (leftConfig.labels.length > 0) {
        leftConfig.labels.forEach(label => {
          if (label >= config.axisX.leftZone.min && label <= leftConfig.max) {
            // Check if value already exists in leftValues (with tolerance)
            const exists = leftValues.some(val => Math.abs(val - label) < 0.0001);
            if (!exists) {
              leftValues.push(label);
            }
          }
        });
        // Sort values
        leftValues.sort((a, b) => a - b);
      }

      // Determine the last value that will be displayed with a label
      const leftLabelValues = leftConfig.labels.length > 0
        ? leftValues.filter(val => isValueInLabels(val, leftConfig.labels))
        : leftValues.filter(val => val <= leftConfig.max && val >= config.axisX.leftZone.min);

      const leftLastValue = config.axisX.leftZone.max;
      const leftFirstValue = leftLabelValues.length > 0 ? leftLabelValues[0] : null;
      // For currency show on first and last, otherwise only on last
      const isCurrency = shouldFormatAsCurrency(config);
      const showUnitsOnFirstAndLast = config.axisX.showUnitsOnFirstAndLast !== undefined
        ? config.axisX.showUnitsOnFirstAndLast
        : isCurrency; // Default: currency - first and last, otherwise only last

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

            // Add labels only for values from labels (if specified) or for all (if labels is empty)
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

      // Label for the rightmost value of the first zone
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

      // Right part
      // Generate all values with step interval from zero (as if lines were from zero)
      const rightValues = [];
      for (let val = rightConfig.step; val <= rightConfig.max; val += rightConfig.step) {
        // Add only values that fall within the right zone range
        if (val >= config.axisX.rightZone.min && val <= rightConfig.max) {
          rightValues.push(val);
        }
      }

      // Add values from labels if they didn't fall into the sequence
      if (rightConfig.labels.length > 0) {
        rightConfig.labels.forEach(label => {
          if (label >= config.axisX.rightZone.min && label <= rightConfig.max) {
            // Check if value already exists in rightValues (with tolerance)
            const exists = rightValues.some(val => Math.abs(val - label) < 0.0001);
            if (!exists) {
              rightValues.push(label);
            }
          }
        });
        // Sort values
        rightValues.sort((a, b) => a - b);
      }

      // Determine the last value that will be displayed with a label for the right part
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

            // Add labels only for values from labels (if specified) or for all (if labels is empty)
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

      // Calculate actual width of right section
      const maxCostXForWidth = scale.valueToX(config.axisX.rightZone.max);
      const rightSectionActualWidth = maxCostXForWidth - scale.rightSectionStart;
      container.style.setProperty('--right-section-width', `${rightSectionActualWidth}%`);
    } else {
      // Without break: unified settings
      const xGridConfig = config.axisX.gridLines;
      // Generate all values with step interval for drawing lines
      const xValues = [];
      for (let val = config.axisX.min + xGridConfig.step; val <= config.axisX.max; val += xGridConfig.step) {
        xValues.push(val);
      }

      // Add values from labels if they didn't fall into the sequence
      if (xGridConfig.labels.length > 0) {
        xGridConfig.labels.forEach(label => {
          if (label >= config.axisX.min && label <= config.axisX.max) {
            // Check if value already exists in xValues (with tolerance)
            const exists = xValues.some(val => Math.abs(val - label) < 0.0001);
            if (!exists) {
              xValues.push(label);
            }
          }
        });
        // Sort values
        xValues.sort((a, b) => a - b);
      }

      // Determine the last value that will be displayed with a label
      const xLabelValues = xGridConfig.labels.length > 0
        ? xValues.filter(val => isValueInLabels(val, xGridConfig.labels))
        : xValues.filter(val => val <= config.axisX.max && val >= config.axisX.min);

      const xLastValue = xLabelValues.length > 0 ? xLabelValues[xLabelValues.length - 1] : null;
      const xFirstValue = xLabelValues.length > 0 ? xLabelValues[0] : null;
      // For currency show on first and last, otherwise only on last
      const isCurrencyX = shouldFormatAsCurrency(config);
      const showUnitsOnFirstAndLastX = config.axisX.showUnitsOnFirstAndLast !== undefined
        ? config.axisX.showUnitsOnFirstAndLast
        : isCurrencyX; // Default: currency - first and last, otherwise only last

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

          // Add labels only for values from labels (if specified) or for all (if labels is empty)
          const shouldAddLabel = isValueInLabels(cost, xGridConfig.labels);
          if (shouldAddLabel) {
            const costLabel = document.createElement("div");
            costLabel.className = "scatterplot-static-label scatterplot-static-label-cost";
            costLabel.style.left = `${x}%`;
            // Format depending on value
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

    // Zero (0) on X axis
    const zeroLabel = document.createElement("div");
    zeroLabel.className = "scatterplot-static-label scatterplot-static-label-zero";
    zeroLabel.textContent = "0";
    container.appendChild(zeroLabel);
  }

  // Find nearest point to cursor
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

  // Highlight point
  highlightPoint(pointElement, modelData) {
    const container = this.container;
    if (!container) return;

    const costLabel = container.querySelector(".scatterplot-axis-x-label");
    const scoreLabel = container.querySelector(".scatterplot-axis-y-label");
    const costLabelTick = container.querySelector(".scatterplot-axis-x-tick");
    const scoreLabelTick = container.querySelector(".scatterplot-axis-y-tick");

    // Remove highlight from previous point
    if (this.activePoint && this.activePoint.element) {
      this.activePoint.element.classList.remove("scatterplot-point-active");
      if (this.activePoint.label) {
        this.activePoint.label.classList.remove("scatterplot-point-label-active");
      }
    }

    // Highlight new point and update labels
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

      // Update cost label and its tick
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

      // Update score label and its tick
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
      // Remove active state from point and label
      if (this.activePoint && this.activePoint.element) {
        this.activePoint.element.classList.remove("scatterplot-point-active");
        if (this.activePoint.label) {
          this.activePoint.label.classList.remove("scatterplot-point-label-active");
        }
      }
      this.activePoint = null;
      // Hide labels and ticks
      if (costLabel) costLabel.style.display = "none";
      if (scoreLabel) scoreLabel.style.display = "none";
      if (costLabelTick) costLabelTick.style.display = "none";
      if (scoreLabelTick) scoreLabelTick.style.display = "none";
    }
  }

  // Initialize interactions
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

  // Create scatter plot
  createScatterPlot() {
    const container = this.container;
    if (!container) {
      console.error("Container not found for creating chart");
      return;
    }

    const config = this.config;
    if (!config || !config.data) {
      console.error("Configuration or data missing:", config);
      return;
    }

    this.axisScale = this.buildAxisScale();
    if (!this.axisScale) {
      console.error("Failed to build axis scale");
      return;
    }

    this.initInteractions();

    // Save axis labels and background highlight before clearing
    const axisLabelX = container.querySelector(".scatterplot-axis-label-x");
    const axisLabelY = container.querySelector(".scatterplot-axis-label-y");
    const backgroundHighlight = container.querySelector(".scatterplot-background-highlight");

    // Clone elements before clearing to preserve their structure
    const axisLabelXClone = axisLabelX ? axisLabelX.cloneNode(true) : null;
    const axisLabelYClone = axisLabelY ? axisLabelY.cloneNode(true) : null;
    const backgroundHighlightClone = backgroundHighlight ? backgroundHighlight.cloneNode(true) : null;

    // Clear container and data
    container.innerHTML = "";
    this.pointsData = [];
    this.activePoint = null;

    // Restore background highlight
    if (backgroundHighlightClone) {
      // Update label text from configuration if specified
      if (config.backgroundHighlight && config.backgroundHighlight.text) {
        const labelElement = backgroundHighlightClone.querySelector(".scatterplot-background-highlight-label");
        if (labelElement) {
          labelElement.textContent = config.backgroundHighlight.text;
        }
      }
      container.appendChild(backgroundHighlightClone);
    }

    // Restore axis labels
    if (axisLabelXClone) {
      container.appendChild(axisLabelXClone);
    }
    if (axisLabelYClone) {
      container.appendChild(axisLabelYClone);
    }

    const scale = this.axisScale;

    // Set CSS variables for horizontal grid lines (if there's a break)
    if (scale.hasBreak) {
      container.style.setProperty('--left-section-end', `${scale.leftSectionEnd}%`);
      container.style.setProperty('--right-section-start', `${scale.rightSectionStart}%`);
    }

    // Draw points
    if (!config.data || config.data.length === 0) {
      console.warn("No data to display");
      return;
    }

    // Find maximum X axis value to determine rightmost points
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
        console.warn("Invalid coordinates for point:", { model, x, y, cost, displayScore });
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

      // Create model name label
      const modelLabel = document.createElement("div");
      modelLabel.className = "scatterplot-point-label";
      // For gpt-5.2 and gpt-5.2-pro label on left
      if (model.model === "gpt-5.2" || model.model === "gpt-5.2-pro") {
        modelLabel.classList.add("scatterplot-point-label-left");
      }
      // For rightmost points (in last 5% of range) label on left
      const threshold = maxXValue * 0.95;
      if (cost >= threshold) {
        modelLabel.classList.add("scatterplot-point-label-left");
      }
      modelLabel.textContent = model.model;
      modelLabel.dataset.vendor = model.vendor;
      modelLabel.style.left = `${x}%`;
      modelLabel.style.top = `${y}%`;
      container.appendChild(modelLabel);

      // Save point data
      this.pointsData.push({
        element: point,
        label: modelLabel,
        model: model,
        xPercent: x,
        yPercent: y,
      });

      container.appendChild(point);
    });

    // Create grid lines
    this.createGridLines();

    // Create dynamic labels for active point
    const costLabel = document.createElement("div");
    costLabel.className = "scatterplot-axis-x-label";
    costLabel.style.display = "none";
    container.appendChild(costLabel);

    const scoreLabel = document.createElement("div");
    scoreLabel.className = "scatterplot-axis-y-label";
    scoreLabel.style.display = "none";
    container.appendChild(scoreLabel);

    // Create ticks and lines for active point labels
    const costLabelTick = document.createElement("div");
    costLabelTick.className = "scatterplot-axis-x-tick";
    costLabelTick.style.display = "none";
    container.appendChild(costLabelTick);

    const scoreLabelTick = document.createElement("div");
    scoreLabelTick.className = "scatterplot-axis-y-tick";
    scoreLabelTick.style.display = "none";
    container.appendChild(scoreLabelTick);

    // Create visual axis break element (if exists)
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

// Class for creating bar chart
class BarChart {
  constructor(containerElement, config) {
    this.container = containerElement;
    this.config = config;
    this.barsData = [];
    this.activeBar = null;
    this.axisScale = null;
  }

  // Build scale functions for Y axis (X axis is categorical)
  buildAxisScale() {
    const config = this.config;

    return {
      hasBreak: false,
      valueToY(value) {
        // Normal axis: larger value -> higher on chart
        const normalized = (value - config.axisY.min) / (config.axisY.max - config.axisY.min);
        return (1 - normalized) * 100;
      },
      indexToX(index, totalBars) {
        // Categorical X axis: equal distribution
        // Each bar occupies equal space, return center position
        const segmentWidth = 100 / totalBars;
        return (index * segmentWidth) + (segmentWidth / 2); // Center of each segment
      },
    };
  }

  // Build grid lines for Y axis only (X axis is categorical, no grid lines)
  createGridLines() {
    const container = this.container;
    const config = this.config;
    const scale = this.axisScale;

    // Grid lines for Y axis
    const yGridConfig = config.axisY.gridLines;
    // Generate all values with step interval for drawing lines
    const yValues = [];
    // Determine number of decimal places for rounding
    const decimals = yGridConfig.step.toString().split('.')[1]?.length || 0;
    for (let val = config.axisY.min + yGridConfig.step; val <= config.axisY.max; val += yGridConfig.step) {
      // Round value to avoid floating point errors
      const roundedVal = Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
      yValues.push(roundedVal);
    }

    // Add values from labels if they didn't fall into the sequence
    if (yGridConfig.labels.length > 0) {
      yGridConfig.labels.forEach(label => {
        if (label >= config.axisY.min && label <= config.axisY.max) {
          // Check if value already exists in yValues (with tolerance)
          const exists = yValues.some(val => Math.abs(val - label) < 0.0001);
          if (!exists) {
            yValues.push(label);
          }
        }
      });
      // Sort values
      yValues.sort((a, b) => a - b);
    }

    // Determine the last value that will be displayed with a label for Y axis
    const yLabelValues = yGridConfig.labels.length > 0
      ? yValues.filter(val => isValueInLabels(val, yGridConfig.labels))
      : yValues.filter(val => val <= config.axisY.max && val >= config.axisY.min);

    const yLastValue = yLabelValues.length > 0 ? yLabelValues[yLabelValues.length - 1] : null;
    const yFirstValue = yLabelValues.length > 0 ? yLabelValues[0] : null;
    // For percentages show only on last, for other units - on first and last
    const unit = config.axisY.unit || "";
    const isPercent = unit.includes("%");
    const showUnitsOnFirstAndLastY = config.axisY.showUnitsOnFirstAndLast !== undefined
      ? config.axisY.showUnitsOnFirstAndLast
      : !isPercent; // Default: percentages - only last, otherwise first and last

    yValues.forEach((score) => {
      if (score <= config.axisY.max && score >= config.axisY.min) {
        const y = scale.valueToY(score);

        // External tick mark
        const tick = document.createElement("div");
        tick.className = "scatterplot-tick-y";
        tick.style.top = `${y}%`;
        container.appendChild(tick);

        // Horizontal grid line
        const gridLine = document.createElement("div");
        gridLine.className = "scatterplot-grid-line-y";
        gridLine.style.top = `${y}%`;
        gridLine.style.width = "100%";
        gridLine.style.left = "0";
        container.appendChild(gridLine);

        // Add labels only for values from labels (if specified) or for all (if labels is empty)
        const shouldAddLabel = isValueInLabels(score, yGridConfig.labels);
        if (shouldAddLabel) {
          const scoreLabel = document.createElement("div");
          scoreLabel.className = "scatterplot-static-label scatterplot-static-label-score";
          scoreLabel.style.top = `${y}%`;
          // Format number with correct number of decimal places
          // Use labelDecimals for axis labels, fallback to staticDecimals or step decimals
          const decimals = config.axisY.labelDecimals !== undefined
            ? config.axisY.labelDecimals
            : (config.axisY.staticDecimals !== undefined
              ? config.axisY.staticDecimals
              : (yGridConfig.step.toString().split('.')[1]?.length || 0));
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
  }

  // Create bars for the chart
  createBars() {
    const container = this.container;
    const config = this.config;
    const scale = this.axisScale;

    if (!config.data || config.data.length === 0) {
      console.warn("No data to display");
      return;
    }

    const totalBars = config.data.length;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width || container.offsetWidth || 1000; // Fallback width
    const gapPixels = 1; // 1 pixel gap between bars
    const totalGapPixels = gapPixels * (totalBars - 1);
    const availableWidth = containerWidth - totalGapPixels;
    const barWidthPixels = availableWidth / totalBars;
    const segmentWidth = 100 / totalBars;

    config.data.forEach((model, index) => {
      const x = scale.indexToX(index, totalBars);
      const score = model.score;
      const yTop = scale.valueToY(score);
      const yBottom = scale.valueToY(config.axisY.min); // Bottom of chart (0)

      if (isNaN(x) || isNaN(yTop) || isNaN(yBottom)) {
        console.warn("Invalid coordinates for bar:", { model, x, yTop, yBottom });
        return;
      }

      // Create bar element
      const bar = document.createElement("div");
      bar.className = "bar-chart-bar";

      // Color: green for Modulate, gray for others
      if (model.vendor === "Modulate") {
        bar.classList.add("modulate");
      }

      // Calculate position: each bar gets equal space with gaps
      // Simple calculation: left = (index * barWidth + index * gap) / containerWidth * 100%
      const barLeftPixels = index * barWidthPixels + index * gapPixels;
      const barLeftPercent = (barLeftPixels / containerWidth) * 100;
      const barWidthPercent = (barWidthPixels / containerWidth) * 100;

      bar.style.left = `${barLeftPercent}%`;
      bar.style.width = `${barWidthPercent}%`;
      bar.style.bottom = `${100 - yBottom}%`;
      bar.style.height = `${yBottom - yTop}%`;
      bar.dataset.vendor = model.vendor;
      bar.dataset.model = model.model;
      bar.dataset.score = model.score;

      // Create label inside bar (model first, then vendor)
      const barLabelContainer = document.createElement("div");
      barLabelContainer.className = "bar-chart-bar-label-container";

      const modelLabel = document.createElement("div");
      modelLabel.className = "bar-chart-bar-model-label";
      modelLabel.textContent = model.model;
      barLabelContainer.appendChild(modelLabel);

      const vendorLabel = document.createElement("div");
      vendorLabel.className = "bar-chart-bar-vendor-label";
      vendorLabel.textContent = model.vendor;
      barLabelContainer.appendChild(vendorLabel);

      bar.appendChild(barLabelContainer);

      // Create score label above bar (aligned to left edge of bar)
      const scoreLabel = document.createElement("div");
      scoreLabel.className = "bar-chart-score-label";
      const decimals = config.axisY.staticDecimals !== undefined ? config.axisY.staticDecimals : 1;
      scoreLabel.textContent = score.toFixed(decimals);
      scoreLabel.style.left = `${barLeftPercent}%`;
      scoreLabel.style.top = `${yTop}%`;
      container.appendChild(scoreLabel);

      container.appendChild(bar);

      // Save bar data
      this.barsData.push({
        element: bar,
        model: model,
        xPercent: x,
        yPercent: yTop,
      });
    });
  }

  // Create X axis labels (vendor and model names) - removed, now inside bars
  createXAxisLabels() {
    // Labels are now created inside bars in createBars()
  }

  // Create bar chart
  createBarChart() {
    const container = this.container;
    if (!container) {
      console.error("Container not found for creating chart");
      return;
    }

    const config = this.config;
    if (!config || !config.data) {
      console.error("Configuration or data missing:", config);
      return;
    }

    this.axisScale = this.buildAxisScale();
    if (!this.axisScale) {
      console.error("Failed to build axis scale");
      return;
    }

    // Save axis labels before clearing
    const axisLabelX = container.querySelector(".scatterplot-axis-label-x");
    const axisLabelY = container.querySelector(".scatterplot-axis-label-y");

    // Clone elements before clearing to preserve their structure
    const axisLabelXClone = axisLabelX ? axisLabelX.cloneNode(true) : null;
    const axisLabelYClone = axisLabelY ? axisLabelY.cloneNode(true) : null;

    // Clear container and data
    container.innerHTML = "";
    this.barsData = [];
    this.activeBar = null;

    // Restore axis labels
    if (axisLabelXClone) {
      container.appendChild(axisLabelXClone);
    }
    if (axisLabelYClone) {
      container.appendChild(axisLabelYClone);
    }

    // Create grid lines (Y axis only)
    this.createGridLines();

    // Create bars (includes labels inside bars and score labels above)
    this.createBars();
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, starting chart initialization");

  // Debug: Check available configs
  const availableConfigs = Object.keys(window).filter(k => k.startsWith('scatterPlotConfig'));
  console.log("Available configurations:", availableConfigs);

  // Find all scatterplot wrappers on the page
  const scatterplotWrappers = document.querySelectorAll(".scatterplot-wrapper");
  console.log(`Found ${scatterplotWrappers.length} scatterplot wrapper(s)`);
  const plots = [];
  const plotConfigs = [];

  // Find all available scatterplots and their configurations
  scatterplotWrappers.forEach((wrapper, index) => {
    const id = wrapper.id;
    if (!id) {
      console.warn(`Scatterplot wrapper at index ${index} has no ID, skipping`);
      return;
    }

    // Extract number from ID (e.g., "scatterplot-1" -> 1)
    const match = id.match(/scatterplot-(\d+)/);
    if (!match) {
      console.warn(`Scatterplot wrapper ID "${id}" doesn't match expected pattern, skipping`);
      return;
    }

    const plotNumber = parseInt(match[1], 10);
    const configName = `scatterPlotConfig${plotNumber}`;
    const config = window[configName];

    if (!config) {
      console.error(`Configuration ${configName} not found for ${id}`);
      console.error(`Make sure config-sc${plotNumber}.js is loaded before script.js`);
      console.error(`Available configs:`, Object.keys(window).filter(k => k.startsWith('scatterPlotConfig')));
      return;
    }

    const container = wrapper.querySelector(".scatterplot-aria");
    if (!container) {
      console.warn(`Container not found for ${id}, skipping`);
      return;
    }

    // Create ScatterPlot instance
    const plot = new ScatterPlot(container, config);
    plot.createScatterPlot();
    plots.push(plot);
    plotConfigs.push({ plot, config, id, plotNumber });
  });

  if (plots.length === 0) {
    console.warn("No scatterplots found or initialized");
    return;
  }

  console.log(`Initialized ${plots.length} scatterplot(s)`);

  // Create vendor legend for specific chart
  function createVendorsLegend(containerSelector, config) {
    const vendorsContainer = document.querySelector(containerSelector);
    if (!vendorsContainer || !config || !config.data) return;

    // Collect unique vendors in order of first appearance in data
    const vendors = [];
    const vendorsSet = new Set();
    config.data.forEach((item) => {
      if (!vendorsSet.has(item.vendor)) {
        vendorsSet.add(item.vendor);
        vendors.push(item.vendor);
      }
    });

    // Create elements for each vendor
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

  // Create legends for each chart using order from data
  plotConfigs.forEach(({ id, config }) => {
    createVendorsLegend(`#${id} .vendors`, config);
  });

  // Control size of all charts
  const widthControl = document.getElementById("width-control");
  const heightControl = document.getElementById("height-control");
  const labelFontSizeControl = document.getElementById("label-font-size-control");
  const pointSizeControl = document.getElementById("point-size-control");
  const axisFontSizeControl = document.getElementById("axis-font-size-control");

  // Collect all scatterplot wrappers and aria containers dynamically
  const allScatterplotWrappers = Array.from(scatterplotWrappers);
  const allScatterplotArias = plotConfigs.map(({ id }) =>
    document.querySelector(`#${id} .scatterplot-aria`)
  ).filter(Boolean);
  const root = document.documentElement;

  // Function to redraw all charts
  const redrawAllPlots = () => {
    plots.forEach(plot => plot.createScatterPlot());
  };

  // Universal function to create control handler with debouncing
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
        // Clear previous timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const input = e.target;
        const rawValue = input.value;
        const parsed = parseValue(rawValue);
        const { min, max } = getMinMax(input);

        // Remove invalid class on input
        input.classList.remove("invalid");

        // Set timeout to apply value
        timeoutId = setTimeout(() => {
          if (validateValue(parsed, min, max)) {
            applyValue(parsed, input);
            redrawCallback();
          } else {
            // Value invalid - color red
            input.classList.add("invalid");
          }
        }, 500); // 500ms debouncing
      },

      onChange: (e) => {
        // For change event (arrows) apply immediately
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

  // Only set up controls if they exist on the page
  if (widthControl && heightControl && allScatterplotWrappers.length > 0 && allScatterplotArias.length > 0) {

    // Handler for width
    const widthHandler = createDebouncedControlHandler({
      parseValue: (val) => parseFloat(val),
      validateValue: (val, min, max) => !isNaN(val) && val >= min,
      applyValue: (val, input) => {
        const min = parseFloat(input.min) || 100;
        const finalValue = Math.max(min, val);
        input.value = finalValue;
        allScatterplotWrappers.forEach((wrapper) => {
          if (wrapper) wrapper.style.width = `${finalValue}px`;
        });
      },
      getMinMax: (input) => ({ min: parseFloat(input.min) || 100, max: Infinity }),
      redrawCallback: redrawAllPlots,
    });
    widthControl.addEventListener("input", widthHandler.onInput);
    widthControl.addEventListener("change", widthHandler.onChange);

    // Handler for height
    const heightHandler = createDebouncedControlHandler({
      parseValue: (val) => parseFloat(val),
      validateValue: (val, min, max) => !isNaN(val) && val >= min,
      applyValue: (val, input) => {
        const min = parseFloat(input.min) || 100;
        const finalValue = Math.max(min, val);
        input.value = finalValue;
        allScatterplotArias.forEach((aria) => {
          if (aria) aria.style.height = `${finalValue}px`;
        });
      },
      getMinMax: (input) => ({ min: parseFloat(input.min) || 100, max: Infinity }),
      redrawCallback: redrawAllPlots,
    });
    heightControl.addEventListener("input", heightHandler.onInput);
    heightControl.addEventListener("change", heightHandler.onChange);

    // Handler for label font size
    if (labelFontSizeControl) {
      const labelFontSizeHandler = createDebouncedControlHandler({
        parseValue: (val) => parseFloat(val),
        validateValue: (val, min, max) => !isNaN(val) && val >= min && val <= max,
        applyValue: (val, input) => {
          const min = parseFloat(input.min) || 0.5;
          const max = parseFloat(input.max) || 1.5;
          const finalValue = Math.max(min, Math.min(max, val));
          input.value = Math.round(finalValue * 100) / 100;
          root.style.setProperty("--scatterplot-label-font-size", `${Math.round(finalValue * 100) / 100}em`);
        },
        getMinMax: (input) => ({ min: parseFloat(input.min) || 0.5, max: parseFloat(input.max) || 1.5 }),
        redrawCallback: redrawAllPlots,
      });
      labelFontSizeControl.addEventListener("input", labelFontSizeHandler.onInput);
      labelFontSizeControl.addEventListener("change", labelFontSizeHandler.onChange);
    }

    // Handler for point size
    if (pointSizeControl) {
      const pointSizeHandler = createDebouncedControlHandler({
        parseValue: (val) => parseFloat(val),
        validateValue: (val, min, max) => !isNaN(val) && val >= min && val <= max,
        applyValue: (val, input) => {
          const min = parseFloat(input.min) || 0.25;
          const max = parseFloat(input.max) || 2;
          const finalValue = Math.max(min, Math.min(max, val));
          input.value = Math.round(finalValue * 100) / 100;
          root.style.setProperty("--scatterplot-point-size", `${Math.round(finalValue * 100) / 100}em`);
        },
        getMinMax: (input) => ({ min: parseFloat(input.min) || 0.25, max: parseFloat(input.max) || 2 }),
        redrawCallback: redrawAllPlots,
      });
      pointSizeControl.addEventListener("input", pointSizeHandler.onInput);
      pointSizeControl.addEventListener("change", pointSizeHandler.onChange);
    }

    // Handler for axis label font size
    if (axisFontSizeControl) {
      const axisFontSizeHandler = createDebouncedControlHandler({
        parseValue: (val) => parseFloat(val),
        validateValue: (val, min, max) => !isNaN(val) && val >= min && val <= max,
        applyValue: (val, input) => {
          const min = parseFloat(input.min) || 0.5;
          const max = parseFloat(input.max) || 1.5;
          const finalValue = Math.max(min, Math.min(max, val));
          input.value = Math.round(finalValue * 100) / 100;
          root.style.setProperty("--scatterplot-axis-font-size", `${Math.round(finalValue * 100) / 100}em`);
        },
        getMinMax: (input) => ({ min: parseFloat(input.min) || 0.5, max: parseFloat(input.max) || 1.5 }),
        redrawCallback: redrawAllPlots,
      });
      axisFontSizeControl.addEventListener("input", axisFontSizeHandler.onInput);
      axisFontSizeControl.addEventListener("change", axisFontSizeHandler.onChange);
    }

    // Initialize default values
    allScatterplotWrappers.forEach((wrapper) => {
      if (wrapper) wrapper.style.width = "1140px";
    });
    allScatterplotArias.forEach((aria) => {
      if (aria) aria.style.height = "400px";
    });
  } else {
    // Without controls, don't set fixed pixel widths - let CSS handle it
    // Only set height for aria containers
    allScatterplotArias.forEach((aria) => {
      if (aria) aria.style.height = "400px";
    });
  }

  // Initialize bar chart
  let barChart1 = null;
  const barChart1Container = document.querySelector('#bar-chart-1 .bar-chart-aria');
  if (barChart1Container && window.barChartConfig1) {
    barChart1 = new BarChart(barChart1Container, window.barChartConfig1);
    barChart1.createBarChart();
  }

  // Redraw on window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      plots.forEach(plot => plot.createScatterPlot());
      if (barChart1) {
        barChart1.createBarChart();
      }
    }, 100);
  });
});
