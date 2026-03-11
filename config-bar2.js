// Bar chart configuration based on scatterPlotConfig5 data (scores only, rounded to 1 decimal)
// Data sorted by score ascending (lowest WER = best first)
const barChartConfig2 = {
  axisY: {
    min: 6.5,
    max: 12.5,
    gridLines: {
      step: 1,
      labels: [7, 8, 9, 10, 11, 12],
      labelsOnly: true,
    },
    staticDecimals: 0,
    hoverDecimals: 0,
    labelDecimals: 0,
    unit: "&hairsp;%",
  },
  hideScoreLabel: true,
  colorModelNameByVendor: true,
  data: [
    { vendor: "Modulate", model: "modulate-velma-2", score: 7.8 },
    { vendor: "ElevenLabs", model: "scribe-v2", score: 7.9 },
    { vendor: "Google", model: "gemini-2.5-pro", score: 8.9 },
    { vendor: "NVIDIA", model: "canary-qwen-2.5b", score: 8.9 },
    { vendor: "AssemblyAI", model: "universal", score: 9.4 },
    { vendor: "Speechmatics", model: "speechmatics-enhanced", score: 9.4 },
    { vendor: "Mistral AI", model: "voxtral-mini", score: 9.6 },
    { vendor: "NVIDIA", model: "parakeet-mnt-1.1b", score: 9.9 },
    { vendor: "Google", model: "chirp-2", score: 10.0 },
    { vendor: "Speechmatics", model: "speechmatics-standard", score: 10.4 },
    { vendor: "OpenAI", model: "whisper-large-v3", score: 10.6 },
    { vendor: "Deepgram", model: "nova-3", score: 12.0 },
  ],
  vendorLegendBelow: true,
};

if (typeof window !== "undefined") {
  window.barChartConfig2 = barChartConfig2;
}
