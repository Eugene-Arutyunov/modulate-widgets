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
    min: 90,
    max: 100,
    unit: "&hairsp;%",
    gridLines: {
      step: 2.5,
      labels: [92.5, 95, 97.5, 100],
    },
    staticDecimals: 1,
    hoverDecimals: 2,
  },
  data: [
    {
      vendor: "Modulate",
      model: "velma-2",
      score: 98.897,
      parametersNumber: 316,
    },
    {
      vendor: "Hiya",
      model: "authenticity-verific",
      score: 97.880,
      parametersNumber: 1000,
    },
    {
      vendor: "Resemble AI",
      model: "resemble-detect-3b",
      score: 97.430,
      parametersNumber: 3000,
    },
    {
      vendor: "Whispeak",
      model: "whispeak",
      score: 96.947,
      parametersNumber: 98,
    },
    {
      vendor: "Deep Learning & Media System Laboratory",
      model: "dlmsl-speaksure-v0.1",
      score: 96.043,
      parametersNumber: 658,
    },
    {
      vendor: "DF Arena ML Researchers",
      model: "df-arena-500m-v1",
      score: 94.190,
      parametersNumber: 500,
    },
    {
      vendor: "DF Arena ML Researchers",
      model: "df-arena-1b-v1",
      score: 94.079,
      parametersNumber: 1000,
    },
    {
      vendor: "Syntra",
      model: "syntra-detector",
      score: 93.893,
      parametersNumber: 584,
    },
    {
      vendor: "Momenta",
      model: "momenta",
      score: 92.947,
      parametersNumber: 350,
    },
  ],
  backgroundHighlight: {
    text: "LEADING DEEPFAKE DETECTION",
  },
  useVisualOffset: false,
};

// Explicitly expose to window for compatibility
if (typeof window !== 'undefined') {
  window.scatterPlotConfig3 = scatterPlotConfig3;
}
