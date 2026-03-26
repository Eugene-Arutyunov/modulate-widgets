const scatterPlotConfig5 = {
  axisX: {
    min: 0,
    max: 9,
    gridLines: {
      step: 1,
      labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    staticDecimals: 0,
    hoverDecimals: 2,
  },
  axisY: {
    min: 7,
    max: 12,
    inverted: false,
    unit: "&hairsp;%",
    gridLines: {
      step: 1,
      labels: [8, 9, 10, 11, 12],
    },
    staticDecimals: 0,
    hoverDecimals: 2,
  },
  data: [
    {
      vendor: "Modulate",
      model: "modulate-velma-2",
      score: 7.80,
      cost: "$0.50",
    },
    {
      vendor: "ElevenLabs",
      model: "elevenlabs-scribe-v2",
      score: 7.90,
      cost: "$6.67",
    },
    {
      vendor: "Google",
      model: "google-gemini-2.5-pro",
      score: 8.85,
      cost: "$4.80",
    },
    {
      vendor: "AssemblyAI",
      model: "assemblyai-universal",
      score: 9.35,
      cost: "$2.50",
    },
    {
      vendor: "Speechmatics",
      model: "speechmatics-enhanced",
      score: 9.35,
      cost: "$6.70",
    },
    {
      vendor: "Gladia",
      model: "gladia-solaria-1",
      score: 9.75,
      cost: "$8.33",
      visualOffset: -0.1,
    },
    {
      vendor: "OpenAI",
      model: "openai-gpt-4o-transcribe",
      score: 9.85,
      cost: "$6.00",
      visualOffset: 0.1,
    },
    {
      vendor: "Google",
      model: "google-chirp-2",
      score: 9.95,
      cost: "$4.00",
      visualOffset: -0.1,
    },
    {
      vendor: "Speechmatics",
      model: "speechmatics-standard",
      score: 10.35,
      cost: "$4.00",
    },
    {
      vendor: "OpenAI",
      model: "openai-whisper-large-v3",
      score: 10.60,
      cost: "$4.23",
      visualOffset: 0.1,
    },
    {
      vendor: "Deepgram",
      model: "deepgram-nova-3",
      score: 11.95,
      cost: "$4.30",
      visualOffset: -0.35,
    },
  ],
  backgroundHighlight: {
    text: "Lowest WER lowest cost",
  },
  useVisualOffset: true,
  legendOrderByCost: true,
};

// Explicitly expose to window for compatibility
if (typeof window !== 'undefined') {
  window.scatterPlotConfig5 = scatterPlotConfig5;
}
