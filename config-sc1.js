const scatterPlotConfig1 = {
  axisX: {
    leftZone: { min: 0, max: 0.07 },
    rightZone: { min: 0.08, max: 1.50 },
    break: {
      leftSectionEnd: 63,
      rightSectionStart: 70,
    },
    // Grid line frequency settings for X axis
    gridLines: {
      left: {
        step: 0.01, // step between lines
        max: 0.07, // draw up to this value
        labels: [], // auto-generated
      },
      right: {
        step: 0.1, // step between lines
        max: 1.50, // draw up to this value
        labels: [0.10, 0.50, 1.00, 1.50], // specific values for labels
      },
    },
    staticDecimals: 2,
    hoverDecimals: { default: 2, exceptions: { "Modulate": 4 } },
  },
  axisY: {
    min: 0,
    max: 5.5,
    // Grid line frequency settings for Y axis
    gridLines: {
      step: 1, // step between lines (each integer)
      labels: [], // auto-generated for each integer from 1 to max
    },
    staticDecimals: 0,
    hoverDecimals: 2,
  },
  data: [
    {
      vendor: "Modulate",
      model: "velma-2-fast",
      modelType: "Fast",
      score: 4.38,
      cost: "$0.000930",
    },
    {
      vendor: "Modulate",
      model: "velma-2",
      modelType: "Regular",
      score: 4.95,
      cost: "$0.003750",
    },
    // {
    //   vendor: "Modulate",
    //   model: "velma-1",
    //   modelType: "Regular",
    //   score: 4.85,
    //   cost: "$0.024440",
    // },
    {
      vendor: "OpenAI",
      model: "gpt-4o-mini",
      modelType: "",
      score: 1.61,
      cost: "$0.031380",
    },
    {
      vendor: "xAI",
      model: "grok-4.1-fast-non-reasoning",
      modelType: "Fast",
      score: 2.25,
      cost: "$0.036410",
    },
    {
      vendor: "xAI",
      model: "grok-4.1-fast-reasoning",
      modelType: "Fast",
      score: 3.39,
      cost: "$0.037320",
    },
    {
      vendor: "Google",
      model: "gemini-2-flash-lite",
      modelType: "",
      score: 2.43,
      cost: "$0.050290",
      visualOffset: 0.1,
    },
    {
      vendor: "DeepSeek",
      model: "deepseek-v3.1",
      modelType: "Regular",
      score: 3.722,
      cost: "$0.054760",
    },
    {
      vendor: "Google",
      model: "gemini-2-flash",
      modelType: "",
      score: 3.28,
      cost: "$0.056060",
    },
    {
      vendor: "DeepSeek",
      model: "deepseek-v3.2",
      modelType: "",
      score: 3.94,
      cost: "$0.062040",
    },
    {
      vendor: "Google",
      model: "gemini-3-flash-min",
      modelType: "",
      score: 3.52,
      cost: "$0.090620",
      visualOffset: -0.35,
    },
    {
      vendor: "DeepSeek",
      model: "deepseek-r1",
      modelType: "",
      score: 4.08,
      cost: "$0.091990",
      visualOffset: -0.2,
    },
    {
      vendor: "OpenAI",
      model: "  ", // intentionally blank — model name TBD
      modelType: "",
      score: 3.03,
      cost: "$0.104280",
      visualOffset: -0.1,
    },
    {
      vendor: "Google",
      model: "gemini-3-flash-med",
      modelType: "",
      score: 3.89,
      cost: "$0.118550",
      visualOffset: -0.25,
    },
    {
      vendor: "OpenAI",
      model: "gpt-4o",
      modelType: "",
      score: 1.49,
      cost: "$0.173850",
    },
    {
      vendor: "Google",
      model: "gemini-2.5-pro",
      modelType: "",
      score: 4.26,
      cost: "$0.283000",
      visualOffset: -0.1,
    },
    {
      vendor: "Google",
      model: "gemini-3-pro",
      modelType: "",
      score: 4.28,
      cost: "$0.397580",
      visualOffset: 0.08,
    },
    {
      vendor: "xAI",
      model: "grok-3",
      modelType: "",
      score: 3.76,
      cost: "$0.398780",
      visualOffset: -0.35,
    },
    {
      vendor: "Deepgram",
      model: "nova-3-intelligence",
      modelType: "",
      score: 2.778,
      cost: "$0.4382",
      visualOffset: -0.15,
    },
    {
      vendor: "ElevenLabs",
      model: "scribe-v2",
      modelType: "",
      score: 2.45,
      cost: "$0.4414",
      visualOffset: -0.1,
    },
    {
      vendor: "xAI",
      model: "grok-4-heavy",
      modelType: "",
      score: 4.36,
      cost: "$0.444790",
      visualOffset: 0.25,
    },
    {
      vendor: "OpenAI",
      model: "gpt-5-mini",
      modelType: "",
      score: 3,
      cost: "$0.559410",
      visualOffset: -0.1,
    },
    {
      vendor: "OpenAI",
      model: "gpt-4-turbo",
      modelType: "",
      score: 0.92,
      cost: "$0.631840",
    },
    {
      vendor: "OpenAI",
      model: "gpt-5.2-pro",
      modelType: "",
      score: 3.73,
      cost: "$1.483230",
    },
    {
      vendor: "OpenAI",
      model: "gpt-5.2",
      modelType: "",
      score: 3.93,
      cost: "$1.498401",
    },
  ],
  backgroundHighlight: {
    text: "Highest accuracy lowest cost",
  },
  useVisualOffset: true,
};

// Explicitly expose to window for compatibility
if (typeof window !== 'undefined') {
  window.scatterPlotConfig1 = scatterPlotConfig1;
}
