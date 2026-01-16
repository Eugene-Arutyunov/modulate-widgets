const scatterPlotConfig2 = {
  axisX: {
    leftZone: { min: 0, max: 4 },
    rightZone: { min: 4, max: 25 },
    break: {
      leftSectionEnd: 63,
      rightSectionStart: 70,
    },
    // Настройки частоты линий сетки для оси X (без разрыва)
    gridLines: {
      left: {
        step: 1, // шаг между линиями
        max: 4, // до какого значения рисовать
        labels: [], // автоматически генерируются
      },
      right: {
        step: 1, // шаг между линиями
        max: 25, // до какого значения рисовать
        labels: [5, 10, 15, 20, 25], // автоматически генерируются
      },
    },
    staticDecimals: 0,
    hoverDecimals: 2,
  },
  axisY: {
    min: 0,
    max: 40,
    inverted: false, // обычная шкала (ноль внизу, большее значение выше)
    unit: "&hairsp;%", // единица измерения для подписей
    // Настройки частоты линий сетки для оси Y
    gridLines: {
      step: 5, // шаг между линиями
      labels: [10, 20, 30, 40], // автоматически генерируются
    },
    staticDecimals: 0,
    hoverDecimals: 1,
  },
  data: [
    {
      vendor: "Modulate",
      model: "velma-2",
      score: 14.90, // WER
      cost: "$0.1300",
    },
    {
      vendor: "NVIDIA",
      model: "canary-qwen",
      score: 21.80,
      cost: "$0.7400",
    },
    {
      vendor: "Mistral",
      model: "mistral-voxtral-mini",
      score: 26.50,
      cost: "$1.0000",
    },
    {
      vendor: "NVIDIA",
      model: "parakeet-tdt-v3",
      score: 21.10,
      cost: "$1.3200",
    },
    {
      vendor: "NVIDIA",
      model: "parakeet-rnnt",
      score: 26.70,
      cost: "$1.9100",
    },
    {
      vendor: "Google",
      model: "gemini-2.5-flash",
      score: 32.50,
      cost: "$1.9200",
    },
    {
      vendor: "AssemblyAI",
      model: "assembly-ai",
      score: 24.70,
      cost: "$2.5000",
    },
    
    {
      vendor: "OpenAI",
      model: "whisper-large-v3",
      score: 29.30,
      cost: "$4.2300",
    },
    {
      vendor: "Deepgram",
      model: "deepgram-nova-2",
      score: 28.10,
      cost: "$4.3000",
    },
    {
      vendor: "OpenAI",
      model: "gpt-4o-transcribe",
      score: 40.00,
      cost: "$6.0000",
    },
    {
      vendor: "ElevenLabs",
      model: "eleven-labs",
      score: 28.10,
      cost: "$6.6700",
    },
    {
      vendor: "Speechmatics",
      model: "speechmatics",
      score: 24.50,
      cost: "$6.7000",
    },
    {
      vendor: "Gladia",
      model: "gladia-solaria-1",
      score: 32.50,
      cost: "$8.3300",
    },
    {
      vendor: "Google",
      model: "chirp-2",
      score: 14.80,
      cost: "$16.0000",
    },
    {
      vendor: "Microsoft",
      model: "azure-speech",
      score: 29.70,
      cost: "$16.7000",
    },
    {
      vendor: "Amazon",
      model: "aws-transcribe",
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
