// Bar chart configuration based on scatterPlotConfig3 data
// Data sorted by score in descending order (Modulate with highest score first)
const barChartConfig1 = {
  axisY: {
    min: 0.7,
    max: 1.0,
    // Grid line frequency settings for Y axis
    gridLines: {
      step: 0.1, // step between lines
      labels: [0.7, 0.8, 0.9, 1.0],
    },
    staticDecimals: 2,
    hoverDecimals: 2,
    labelDecimals: 1, // Decimals for axis Y labels
  },
  // Data sorted by score in descending order
  data: [
    {
      vendor: "Modulate",
      model: "velma-2",
      score: 0.9610, // F1-Score
      parametersNumber: 316,
    },
    {
      vendor: "Resemble AI",
      model: "resemble-detect-3b",
      score: 0.9490,
      parametersNumber: 3000,
    },
    {
      vendor: "Deep Learning",
      model: "dlmsl-speaksure-v0.1",
      score: 0.9380,
      parametersNumber: 658,
    },
    {
      vendor: "Whispeak",
      model: "whispeak",
      score: 0.9250,
      parametersNumber: 98,
    },
    {
      vendor: "DF Arena",
      model: "df-arena-1b-v1",
      score: 0.8860,
      parametersNumber: 1000,
    },
    {
      vendor: "Momenta",
      model: "momenta",
      score: 0.8740,
      parametersNumber: 350,
    },
    {
      vendor: "Syntra",
      model: "syntra-detector",
      score: 0.8700,
      parametersNumber: 584,
    },
    {
      vendor: "DF Arena",
      model: "df-arena-100m-v1",
      score: 0.8370,
      parametersNumber: 100,
    },
    {
      vendor: "Singapore Tech",
      model: "molex",
      score: 0.8360,
      parametersNumber: 376,
    },
    {
      vendor: "Resemble AI",
      model: "resemble-detect",
      score: 0.8250,
      parametersNumber: 2112,
    },
    {
      vendor: "DF Arena",
      model: "df-arena-100m-v0",
      score: 0.8000,
      parametersNumber: 100,
    },
  ],
};

// Explicitly expose to window for compatibility
if (typeof window !== 'undefined') {
  window.barChartConfig1 = barChartConfig1;
}
