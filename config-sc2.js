const scatterPlotConfig2 = {
  title: "Transcription",
  axisX: {
    label: "Cost",
    leftZone: { min: 0, max: 24 },
    rightZone: { min: 25, max: 30 },
    break: {
      leftSectionEnd: 85,
      rightSectionStart: 90,
    },
    // Настройки частоты линий сетки для оси X (без разрыва)
    gridLines: {
      left: {
        step: 1, // шаг между линиями
        max: 24, // до какого значения рисовать
        labels: [], // автоматически генерируются
      },
      right: {
        step: 1, // шаг между линиями
        max: 24, // до какого значения рисовать
        labels: [], // автоматически генерируются
      },
    },
  },
  axisY: {
    label: "Word Error Rate (WER)",
    min: 0,
    max: 45,
    inverted: false, // обычная шкала (ноль внизу, большее значение выше)
    // Настройки частоты линий сетки для оси Y
    gridLines: {
      step: 5, // шаг между линиями
      labels: [], // автоматически генерируются
    },
  },
  data: [
    {
      vendor: "Modulate",
      model: "velma 2.0",
      score: 14.90, // WER
      cost: "$0.1300",
    },
    {
      vendor: "NVIDIA",
      model: "Canary QWEN",
      score: 21.80,
      cost: "$0.7400",
    },
    {
      vendor: "Voxtral",
      model: "Mini",
      score: 26.50,
      cost: "$1.0000",
    },
    {
      vendor: "NVIDIA",
      model: "Parakeet TDT",
      score: 21.10,
      cost: "$1.3200",
    },
    {
      vendor: "NVIDIA",
      model: "Parakeet RNNT",
      score: 26.70,
      cost: "$1.9100",
    },
    {
      vendor: "Gemini",
      model: "Gemini 2.5 – Flash",
      score: 32.50,
      cost: "$1.9200",
    },
    {
      vendor: "AssemblyAI",
      model: "Universal",
      score: 24.70,
      cost: "$2.5000",
    },
    {
      vendor: "Voxtral",
      model: "Small",
      score: 28.20,
      cost: "$4.0000",
    },
    {
      vendor: "OpenAI",
      model: "Whisper Large v3",
      score: 29.30,
      cost: "$4.2300",
    },
    {
      vendor: "Deepgram",
      model: "Nova 2",
      score: 28.10,
      cost: "$4.3000",
    },
    {
      vendor: "OpenAI",
      model: "GPT-4o Transcribe",
      score: 44.30,
      cost: "$6.0000",
    },
    {
      vendor: "ElevenLabs",
      model: "Scribe",
      score: 28.10,
      cost: "$6.6700",
    },
    {
      vendor: "Speechmatics",
      model: "Enhanced",
      score: 24.50,
      cost: "$6.7000",
    },
    {
      vendor: "Gladia",
      model: "Solaria 1",
      score: 32.50,
      cost: "$8.3300",
    },
    {
      vendor: "Gemini",
      model: "Chirp 2",
      score: 14.80,
      cost: "$16.0000",
    },
    {
      vendor: "Microsoft",
      model: "Azure – Speech Service",
      score: 29.70,
      cost: "$16.7000",
    },
    {
      vendor: "Amazon",
      model: "Transcribe",
      score: 24.20,
      cost: "$24.0000",
    },
  ],
  backgroundHighlight: {
    text: "Lowest word error lowest cost",
    position: "bottom-left", // позиция: top-left или bottom-left
  },
  useVisualOffset: false,
};
