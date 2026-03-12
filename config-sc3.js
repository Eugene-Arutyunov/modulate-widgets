const scatterPlotConfig3 = {
  axisX: {
    leftZone: { min: 0, max: 650 },
    rightZone: { min: 650, max: 3000 },
    break: {
      leftSectionEnd: 63,
      rightSectionStart: 70,
    },
    // Grid line frequency settings for X axis (with break)
    gridLines: {
      left: {
        step: 100, // step between lines
        max: 650, // draw up to this value
        labels: [100, 200, 300, 400, 500, 600, 650], // specific values for labels
      },
      right: {
        step: 125, // step between lines
        max: 3000, // draw up to this value
        labels: [650, 1000, 1500, 2000, 2500, 3000], // specific values for labels
      },
    },
    staticDecimals: 0,
    hoverDecimals: 0,
  },
  axisY: {
    min: 0.75,
    max: 1.0,
    // Grid line frequency settings for Y axis
    gridLines: {
      step: 0.025, // step between lines
      labels: [0.8, 0.9, 1.0],
    },
    staticDecimals: 1,
    hoverDecimals: 1,
  },
  data: [
    {
      vendor: "Modulate",
      model: "velma-2",
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
      vendor: "Deep Learning & Media System Laboratory",
      model: "dlmsl-speaksure-v0.1",
      score: 0.96043, // 96.043%
      parametersNumber: 658,
    },
    {
      vendor: "DF Arena ML Researchers",
      model: "df-arena-500m-v1",
      score: 0.94190, // 94.190%
      parametersNumber: 500,
    },
    {
      vendor: "DF Arena ML Researchers",
      model: "df-arena-1b-v1",
      score: 0.94079, // 94.079%
      parametersNumber: 1000,
    },
    {
      vendor: "Syntra",
      model: "syntra-detector",
      score: 0.93893, // 93.893%
      parametersNumber: 584,
    },
    {
      vendor: "Momenta",
      model: "momenta",
      score: 0.92947, // 92.947%
      parametersNumber: 350,
    },
    {
      vendor: "DF Arena ML Researchers",
      model: "df-raptor",
      score: 0.92080, // 92.080%
      parametersNumber: 100,
    },
    {
      vendor: "Singapore Agency for Science, Technology & Research",
      model: "molex",
      score: 0.90483, // 90.483%
      parametersNumber: 376,
    },
    {
      vendor: "Resemble AI",
      model: "resemble-detect",
      score: 0.89170, // 89.170%
      parametersNumber: 2112,
    },
  ],
  backgroundHighlight: {
    text: "LEADING DEEPFAKE DETECTION",
    position: "top-left",
  },
  useVisualOffset: false,
};

// Explicitly expose to window for compatibility
if (typeof window !== 'undefined') {
  window.scatterPlotConfig3 = scatterPlotConfig3;
}
