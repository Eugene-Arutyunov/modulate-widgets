const scatterPlotConfig3 = {
  axisX: {
    leftZone: { min: 0, max: 650 },
    rightZone: { min: 650, max: 3000 },
    break: {
      leftSectionEnd: 63,
      rightSectionStart: 70,
    },
    // Настройки частоты линий сетки для оси X (с разрывом)
    gridLines: {
      left: {
        step: 100, // шаг между линиями
        max: 650, // до какого значения рисовать
        labels: [100, 200, 300, 400, 500, 600, 650], // конкретные значения для подписей
      },
      right: {
        step: 125, // шаг между линиями
        max: 3000, // до какого значения рисовать
        labels: [650, 1000, 1500, 2000, 2500, 3000], // конкретные значения для подписей
      },
    },
    staticDecimals: 0,
    hoverDecimals: 0,
  },
  axisY: {
    min: 0.75,
    max: 1.0,
    // Настройки частоты линий сетки для оси Y
    gridLines: {
      step: 0.025, // шаг между линиями
      labels: [0.8, 0.9, 1.0],
    },
    staticDecimals: 1,
    hoverDecimals: 1,
  },
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
      vendor: "Deep Learning & Media System Laboratory",
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
      vendor: "DF Arena ML Researchers",
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
      vendor: "Singapore Agency for Science, Technology & Research",
      model: "molex",
      score: 0.8360,
      parametersNumber: 376,
    },
    {
      vendor: "DF Arena ML Researchers",
      model: "df-arena-100m-v1",
      score: 0.8370,
      parametersNumber: 100,
    },
    {
      vendor: "Resemble AI",
      model: "resemble-detect",
      score: 0.8250,
      parametersNumber: 2112,
    },
    {
      vendor: "DF Arena ML Researchers",
      model: "df-arena-100m-v0",
      score: 0.8000,
      parametersNumber: 100,
    },
  ],
  backgroundHighlight: {
    text: "LEADING DEEPFAKE DETECTION",
    position: "top-left",
  },
  useVisualOffset: false,
};
