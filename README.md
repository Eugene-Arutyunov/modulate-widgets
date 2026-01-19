# Scatterplot Widgets

Interactive scatterplot visualization system that automatically detects and initializes any number of scatterplots on a page.

## How It Works

The script automatically finds all elements with class `.scatterplot-wrapper` on the page. For each scatterplot with ID `scatterplot-N`, it looks for a corresponding configuration variable `scatterPlotConfigN`. Only scatterplots with both a container and a valid configuration are initialized.

**Example:** A scatterplot with `id="scatterplot-1"` will use `scatterPlotConfig1` from `config-sc1.js`.

## Configuration Structure

### Basic Structure

```javascript
const scatterPlotConfig1 = {
  axisX: { /* axis config */ },
  axisY: { /* axis config */ },
  data: [ /* data points */ ],
  backgroundHighlight: { text: "..." },
  useVisualOffset: true
}
```

### Axis Break

When X-axis has a break (e.g., to handle large gaps in data), use `leftZone` and `rightZone`:

```javascript
axisX: {
  leftZone: { min: 0, max: 0.07 },
  rightZone: { min: 0.08, max: 1.50 },
  break: {
    leftSectionEnd: 63,    // percentage where left section ends
    rightSectionStart: 70  // percentage where right section starts
  },
  gridLines: {
    left: { step: 0.01, max: 0.07, labels: [] },
    right: { step: 0.1, max: 1.50, labels: [0.10, 0.50, 1.00, 1.50] }
  }
}
```

### Visual Offset

Points can be visually offset without changing their actual score value (useful for overlapping labels):

```javascript
{
  vendor: "Google",
  model: "gemini-2-flash-lite",
  score: 2.43,           // actual score
  visualOffset: 0.1,      // visual adjustment (only if useVisualOffset: true)
  cost: "$0.050290"
}
```

### Hover Decimals with Exceptions

Different vendors can show different decimal precision on hover:

```javascript
hoverDecimals: { 
  default: 2, 
  exceptions: { "Modulate": 4 } 
}
```

### Data Points

- `cost` can be a string with `$` prefix (e.g., `"$0.000930"`) or a number
- `visualOffset` only applies when `useVisualOffset: true` in config
- `speed` is optional metadata

### Vendor Legend Order

Vendors appear in the legend in the order of their first appearance in the `data` array. This ensures each chart's legend reflects the order of vendors in that specific chart's data.

## Usage

1. Include config files: `<script src="config-sc1.js"></script>`
2. Include main script: `<script src="script.js"></script>`
3. Add scatterplot HTML with matching ID: `<div id="scatterplot-1" class="scatterplot-wrapper">...</div>`

Controls are optional—the script works with or without them.
