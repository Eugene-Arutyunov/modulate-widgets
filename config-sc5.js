const scatterPlotConfig5 = {
  axisX: {
    min: 0,
    max: 0.40,
    gridLines: {
      step: 0.05,
      labels: [0, 0.10, 0.20, 0.30, 0.40],
    },
    staticDecimals: 2,
    hoverDecimals: 2,
  },
  axisY: {
    min: 7,
    max: 13,
    inverted: false,
    unit: "&hairsp;%",
    gridLines: {
      step: 1,
      labels: [8, 9, 10, 11, 12, 13],
    },
    staticDecimals: 0,
    hoverDecimals: 2,
  },
  data: [
    {
      vendor: "Modulate",
      model: "modulate-transcribe",
      score: 7.79,
      cost: "$0.03",
    },
    {
      vendor: "ElevenLabs",
      model: "scribe-v2",
      score: 7.90,
      cost: "$0.31",
      visualOffset: -0.1,
    },
    {
      vendor: "AssemblyAI",
      model: "assemblyai-universal-2",
      score: 9.35,
      cost: "$0.15",
    },
    {
      vendor: "AssemblyAI",
      model: "assemblyai-universal-3-pro",
      score: 7.91,
      cost: "$0.21",
    },
    {
      vendor: "Speechmatics",
      model: "speechmatics-enhanced",
      score: 9.35,
      cost: "$0.24",
      visualOffset: 0.1,
    },
    {
      vendor: "Google",
      model: "google-gemini-2.5-pro",
      score: 8.85,
      cost: "$0.29",
    },
    {
      vendor: "OpenAI",
      model: "gpt-4o-transcribe",
      score: 9.85,
      cost: "$0.36",
      visualOffset: 0.1,
    },
    {
      vendor: "Google",
      model: "google-chirp-2",
      score: 9.95,
      cost: "$0.24",
      visualOffset: -0.1,
    },
    {
      vendor: "Deepgram",
      model: "deepgram-nova-3",
      score: 11.95,
      cost: "$0.31",
      visualOffset: 0.35,
    },
    {
      vendor: "OpenAI",
      model: "openai-whisper-large-v3",
      score: 10.60,
      cost: "$0.36",
      visualOffset: -0.1,
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
