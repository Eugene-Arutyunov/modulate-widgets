// Bar chart configuration based on scatterPlotConfig5 data (scores only, rounded to 1 decimal)
// Data sorted by score ascending (lowest WER = best first)
const barChartConfig2 = {
  axisY: {
    min: 5.5,
    max: 13,
    gridLines: {
      step: 1,
      labels: [6, 7, 8, 9, 10, 11, 12, 13],
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
    { vendor: "AssemblyAI", model: "universal", score: 9.4 },
    { vendor: "Speechmatics", model: "speechmatics-enhanced", score: 9.4 },
    { vendor: "Gladia", model: "solaria-1", score: 9.8 },
    { vendor: "OpenAI", model: "gpt-4o-transcribe", score: 9.9 },
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
