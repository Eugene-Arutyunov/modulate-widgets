const scatterPlotConfig5 = {
  axisX: {
    leftZone: { min: 0, max: 4 },
    rightZone: { min: 4, max: 17 },
    break: {
      leftSectionEnd: 63,
      rightSectionStart: 70,
    },
    gridLines: {
      left: {
        step: 1,
        max: 3,
        labels: [1, 2, 3],
      },
      right: {
        step: 2,
        max: 16,
        labels: [4, 8, 12, 16],
      },
    },
    staticDecimals: 0,
    hoverDecimals: 2,
  },
  axisY: {
    min: 7,
    max: 13,
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
      model: "scribe-v2",
      score: 7.90,
      cost: "$6.67",
    },
    {
      vendor: "ElevenLabs",
      model: "scribe-v1",
      score: 8.50,
      cost: "$6.67",
    },
    {
      vendor: "Google",
      model: "gemini-2.5-pro",
      score: 8.85,
      cost: "$4.80",
    },
    {
      vendor: "NVIDIA",
      model: "canary-qwen-2.5b",
      score: 8.85,
      cost: "$0.74",
    },
    {
      vendor: "AssemblyAI",
      model: "universal",
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
      vendor: "AssemblyAI",
      model: "slam-1",
      score: 9.45,
      cost: "$4.50",
    },
    {
      vendor: "Mistral AI",
      model: "voxtral-mini",
      score: 9.60,
      cost: "$1.00",
    },
    {
      vendor: "Gladia",
      model: "solaria-1",
      score: 9.75,
      cost: "$8.33",
    },
    {
      vendor: "NVIDIA",
      model: "parakeet-mnt-1.1b",
      score: 9.85,
      cost: "$1.91",
    },
    {
      vendor: "OpenAI",
      model: "gpt-4o-mini-transcribe",
      score: 9.95,
      cost: "$16.00",
    },
    {
      vendor: "Google",
      model: "chirp-2",
      score: 9.95,
      cost: "$4.00",
    },
    {
      vendor: "Speechmatics",
      model: "speechmatics-standard",
      score: 10.35,
      cost: "$4.00",
    },
    {
      vendor: "OpenAI",
      model: "whisper-large-v3",
      score: 10.60,
      cost: "$4.23",
    },
    {
      vendor: "Deepgram",
      model: "nova-2",
      score: 11.95,
      cost: "$4.30",
    },
    {
      vendor: "Deepgram",
      model: "nova-3",
      score: 11.95,
      cost: "$4.30",
      visualOffset: -0.35,
    },
  ],
  backgroundHighlight: {
    text: "Lowest word error rate lowest cost",
    position: "bottom-left",
  },
  useVisualOffset: true,
};

// Explicitly expose to window for compatibility
if (typeof window !== 'undefined') {
  window.scatterPlotConfig5 = scatterPlotConfig5;
}
