// Bar chart configuration based on scatterPlotConfig3 data
// Data sorted by score in descending order (Modulate with highest score first)
const barChartConfig1 = {
  axisY: {
    min: 0.93,
    max: 1.0,
    gridLines: {
      step: 0.02,
      labels: [0.92, 0.94, 0.96, 0.98, 1.0],
    },
    staticDecimals: 1,
    hoverDecimals: 2,
    labelDecimals: 0,
    unit: "%",
    showUnitsOnFirstAndLast: false,
    scoresInDecimal: true,
  },
  vendorNameFirst: true,
  // Data sorted by score in descending order
  data: [
    {
      vendor: "Modulate",
      model: "velma-deepfake-detect",
      score: 0.98897, // F1-Score (98.897%)
      parametersNumber: 316,
    },
    {
      vendor: "Hiya",
      model: "authenticity-verific",
      score: 0.97880, // 97.880%
      parametersNumber: 1000,
    },
    {
      vendor: "Resemble AI",
      model: "resemble-detect-3b",
      score: 0.97430, // 97.430%
      parametersNumber: 3000,
    },
    {
      vendor: "Whispeak",
      model: "whispeak",
      score: 0.96947, // 96.947%
      parametersNumber: 98,
    },
    {
      vendor: "Deep Learning",
      model: "dlmsl-speaksure-v0.1",
      score: 0.96043, // 96.043%
      parametersNumber: 658,
    },
    // { vendor: "DF Arena", model: "df-arena-500m-v1", score: 0.94190, parametersNumber: 500 },
    // { vendor: "DF Arena", model: "df-arena-1b-v1", score: 0.94079, parametersNumber: 1000 },
    // { vendor: "Syntra", model: "syntra-detector", score: 0.93893, parametersNumber: 584 },
    // { vendor: "Momenta", model: "momenta", score: 0.92947, parametersNumber: 350 },
  ],
};

// Desktop variant: all 9 bars, y-axis from 0.9
const barChartConfig1Desktop = {
  axisY: {
    min: 0.92,
    max: 1.0,
    gridLines: {
      step: 0.02,
      labels: [0.92, 0.94, 0.96, 0.98, 1.0],
    },
    staticDecimals: 1,
    hoverDecimals: 2,
    labelDecimals: 0,
    unit: "%",
    showUnitsOnFirstAndLast: false,
    scoresInDecimal: true,
  },
  vendorNameFirst: true,
  data: [
    { vendor: "Modulate", model: "velma-deepfake-detect", score: 0.98897, parametersNumber: 316 },
    { vendor: "Hiya", model: "authenticity-verific", score: 0.97880, parametersNumber: 1000 },
    { vendor: "Resemble AI", model: "resemble-detect-3b", score: 0.97430, parametersNumber: 3000 },
    { vendor: "Whispeak", model: "whispeak", score: 0.96947, parametersNumber: 98 },
    { vendor: "Deep Learning", model: "dlmsl-speaksure-v0.1", score: 0.96043, parametersNumber: 658 },
    { vendor: "DF Arena", model: "df-arena-500m-v1", score: 0.94190, parametersNumber: 500 },
    { vendor: "DF Arena", model: "df-arena-1b-v1", score: 0.94079, parametersNumber: 1000 },
    { vendor: "Syntra", model: "syntra-detector", score: 0.93893, parametersNumber: 584 },
    { vendor: "Momenta", model: "momenta", score: 0.92947, parametersNumber: 350 },
  ],
};

// Explicitly expose to window for compatibility
if (typeof window !== 'undefined') {
  window.barChartConfig1 = barChartConfig1;
  window.barChartConfig1Desktop = barChartConfig1Desktop;
}
