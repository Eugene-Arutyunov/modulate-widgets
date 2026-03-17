const groupedBarConfig2 = {
  axisY: {
    min: 0,
    max: 0.6,
    unit: "$",
    gridLines: {
      step: 0.1,
      labels: [0.2, 0.4, 0.6],
    },
    staticDecimals: 2,
    labelDecimals: 1,
    hoverDecimals: 2,
    showUnitsOnFirstAndLast: true,
  },
  groupGap: 1,
  vendorNameFirst: true,
  groups: [
    {
      label: "Batch Transcription",
      data: [
        { vendor: "Modulate", model: "velma-transcribe", score: 0.03 },
        { vendor: "Deepgram", model: "nova-2", score: 0.26 },
        { vendor: "Deepgram", model: "nova-3", score: 0.31 },
      ],
    },
    {
      label: "Streaming Transcription",
      data: [
        { vendor: "Modulate", model: "velma-transcribe", score: 0.06 },
        { vendor: "Deepgram", model: "nova-2", score: 0.35 },
        { vendor: "Deepgram", model: "nova-3", score: 0.55 },
      ],
    },
  ],
};

if (typeof window !== 'undefined') {
  window.groupedBarConfig2 = groupedBarConfig2;
}
