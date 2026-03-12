// Variant of scatterPlotConfig2 with velma-2-transcribe cost changed from $0.05 to $0.42
// Used in scatterplot-4 to show the AMI transcription benchmark at standard pricing
const scatterPlotConfig4 = {
  axisX: {
    leftZone: { min: 0, max: 5 },
    rightZone: { min: 5, max: 25 },
    break: {
      leftSectionEnd: 63,
      rightSectionStart: 70,
    },
    gridLines: {
      left: {
        step: 1,
        max: 4,
        labels: [],
      },
      right: {
        step: 1,
        max: 25,
        labels: [5, 10, 15, 20, 25],
      },
    },
    staticDecimals: 0,
    hoverDecimals: 2,
  },
  axisY: {
    min: 0,
    max: 40,
    inverted: false,
    unit: "&hairsp;%",
    gridLines: {
      step: 5,
      labels: [10, 20, 30, 40],
    },
    staticDecimals: 0,
    hoverDecimals: 1,
  },
  data: [
    {
      vendor: "Modulate",
      model: "velma-2-transcribe",
      score: 14.90,
      cost: "$0.42",
    },
    {
      vendor: "NVIDIA",
      model: "canary-qwen",
      score: 21.80,
      cost: "$0.7400",
      visualOffset: 0.4,
    },
    {
      vendor: "Mistral",
      model: "voxtral-mini",
      score: 26.50,
      cost: "$1.0000",
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
      vendor: "Deepgram",
      model: "deepgram-nova-2",
      score: 28.10,
      cost: "$4.3000",
      visualOffset: -0.5,
    },
    {
      vendor: "Speechmatics",
      model: "speechmatics",
      score: 24.50,
      cost: "$6.7000",
    },
    {
      vendor: "ElevenLabs",
      model: "eleven-labs-scribe-v2",
      score: 26.2,
      cost: "$6.6700",
    },
    {
      vendor: "Gladia",
      model: "gladia-solaria-1",
      score: 32.50,
      cost: "$8.3300",
    },
    {
      vendor: "OpenAI",
      model: "whisper-large-v3",
      score: 29.30,
      cost: "$4.2300",
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
    {
      vendor: "NVIDIA",
      model: "parakeet-tdt-v3",
      score: 21.10,
      cost: "$1.3200",
      visualOffset: -0.7,
    },
    {
      vendor: "NVIDIA",
      model: "parakeet-rnnt",
      score: 26.70,
      cost: "$1.9100",
    },
    {
      vendor: "OpenAI",
      model: "gpt-4o-transcribe",
      score: 40.00,
      cost: "$6.0000",
    },
    {
      vendor: "Google",
      model: "chirp-2",
      score: 14.80,
      cost: "$16.0000",
    },
  ],
  backgroundHighlight: {
    text: "Lowest word error lowest cost",
  },
  useVisualOffset: true,
};

if (typeof window !== "undefined") {
  window.scatterPlotConfig4 = scatterPlotConfig4;
}
