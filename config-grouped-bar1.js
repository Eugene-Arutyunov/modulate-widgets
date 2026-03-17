const groupedBarConfig1 = {
  axisY: {
    min: 0,
    max: 30,
    unit: "%",
    gridLines: {
      step: 5,
      labels: [10, 20, 30],
    },
    staticDecimals: 1,
    labelDecimals: 0,
    hoverDecimals: 2,
    showUnitsOnFirstAndLast: false,
  },
  groupGap: 1,
  vendorNameFirst: true,
  groups: [
    {
      label: "Earnings-22",
      data: [
        { vendor: "Modulate", model: "velma-transcribe", score: 7.55 },
        { vendor: "Deepgram", model: "nova-3", score: 15.70 },
      ],
    },
    {
      label: "VoxPopuli",
      data: [
        { vendor: "Modulate", model: "velma-transcribe", score: 8.04 },
        { vendor: "Deepgram", model: "nova-3", score: 8.20 },
      ],
    },
    {
      label: "AMI Meeting Corpus",
      data: [
        { vendor: "Modulate", model: "velma-transcribe", score: 14.90 },
        { vendor: "Deepgram", model: "nova-2", score: 28.10 },
      ],
    },
  ],
};

if (typeof window !== 'undefined') {
  window.groupedBarConfig1 = groupedBarConfig1;
}
