// Horizontal bar chart: Cost per hour (one row per vendor from Price/Cost table)
// Data: Modulate, AssemblyAI, Deepgram, ElevenLabs — no duplicate vendors
const barChartConfig3 = {
  axisX: {
    min: 0,
    max: 0.45,
    hideAxis: true,
    gridLines: {
      step: 0.1,
      labels: [0, 0.1, 0.2, 0.3, 0.4],
    },
    staticDecimals: 2,
    unit: "$",
    formatCurrency: true,
  },
  data: [
    { vendor: "Modulate", model: "modulate-velma-2", costPerHour: 0.03 },
    { vendor: "AssemblyAI", model: "universal", costPerHour: 0.15 },
    { vendor: "Deepgram", model: "nova-2", costPerHour: 0.258 },
    { vendor: "ElevenLabs", model: "scribe-v2", costPerHour: 0.4 },
  ],
};

if (typeof window !== "undefined") {
  window.barChartConfig3 = barChartConfig3;
}
