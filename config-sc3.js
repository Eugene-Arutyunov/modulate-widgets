const scatterPlotConfig3 = {
  title: "Synthetic Voice / Deepfake Detection Model",
  axisX: {
    label: "Cost",
    min: 0,
    max: 3000,
    // Настройки частоты линий сетки для оси X (без разрыва)
    gridLines: {
      step: 500, // шаг между линиями
      labels: [0, 500, 1000, 1500, 2000, 2500, 3000], // конкретные значения для подписей
    },
  },
  axisY: {
    label: "Average F1-Score",
    min: 0,
    max: 1.0,
    // Настройки частоты линий сетки для оси Y
    gridLines: {
      step: 0.1, // шаг между линиями
      labels: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    },
  },
  data: [
    {
      vendor: "Modulate",
      model: "Synthetic Voice Detector",
      score: 0.96, // F1-Score
      cost: 316,
    },
    {
      vendor: "Resemble",
      model: "Detect-3B-Omni",
      score: 0.95,
      cost: 3000,
    },
    {
      vendor: "DLMSL",
      model: "SpeakSure-v0.1",
      score: 0.94,
      cost: 658,
    },
    {
      vendor: "Whispeak",
      model: "Whispeak",
      score: 0.93,
      cost: 98,
    },
    {
      vendor: "DF Arena",
      model: "1B V1",
      score: 0.89,
      cost: 1000,
    },
    {
      vendor: "Momenta",
      model: "Momenta",
      score: 0.88,
      cost: 350,
    },
    {
      vendor: "Syntra",
      model: "Detector",
      score: 0.87,
      cost: 584,
    },
    {
      vendor: "MoLEx",
      model: "MoLEx",
      score: 0.84,
      cost: 376,
    },
    {
      vendor: "DF Arena",
      model: "100M V1",
      score: 0.84,
      cost: 100,
    },
    {
      vendor: "Resemble",
      model: "Detect",
      score: 0.83,
      cost: 2112,
    },
    {
      vendor: "DF Arena",
      model: "100M V0",
      score: 0.8,
      cost: 100,
    },
  ],
  useVisualOffset: false,
};
