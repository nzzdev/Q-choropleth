<script>
  export let type;
  export let cantonCode;
  export let value;
  export let color;

  // adjust this for small number of buckets
  function getFontColor(color) {
    const colorClass = color.colorClass;
    if (color.customColor !== "" && color.customTextColor !== undefined) {
      if (color.customTextColor === "light") {
        return "s-color-gray-1";
      } else {
        return "s-color-gray-9";
      }
    }
    if (colorClass === "s-color-gray-4") {
      return "s-color-gray-6";
    }
    let colorSplit = colorClass.split("-");
    let colorScaleNumber = parseInt(colorSplit[colorSplit.length - 2]);
    let colorIntensity = parseInt(colorSplit[colorSplit.length - 1]);

    if (colorSplit.includes("diverging")) {
      if (colorScaleNumber === 2) {
        return "s-color-gray-1";
      }
      if (colorScaleNumber > 2 && colorScaleNumber < 8) {
        return (colorIntensity > 2) & (colorIntensity < colorScaleNumber - 2)
          ? "s-color-gray-9"
          : "s-color-gray-1";
      }
      return colorIntensity > 3 && colorIntensity < colorScaleNumber - 3
        ? "s-color-gray-9"
        : "s-color-gray-1";
    }

    if (colorScaleNumber === 2) {
      return colorIntensity === 1 ? "s-color-gray-1" : "s-color-gray-9";
    }

    if (colorScaleNumber >= 5) {
      colorIntensity < 4 ? "s-color-gray-1" : "s-color-gray-9";
    }

    return colorScaleNumber - colorIntensity >= 2
      ? "s-color-gray-1"
      : "s-color-gray-9";
  }

  function getStrokeColor(color) {
    if (color === "swiss-hexagon-map-row-element--no-data") {
      return "";
    }
  }
</script>

{#if type === 'empty'}
  <div class="swiss-hexagon-map-row-element" />
{:else if type === 'empty-half'}
  <div
    class="swiss-hexagon-map-row-element swiss-hexagon-map-row-element--half
    s-viz-color-one-5" />
{:else if value === null || value === undefined}
  <div
    class="swiss-hexagon-map-row-element {color.colorClass}"
    style="color: {color.customColor}">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 70 80">
      <path
        shape-rendering="geometricPrecision"
        style="shape-rendering: geometricPrecision"
        stroke="currentColor"
        stroke-width="1"
        fill="#fff"
        d="M34.64101615137754 0L70 20L70 60L34.64101615137754 80L0 60L0 20Z" />
      <g class="s-font-note">
        <text
          class="s-color-gray-4"
          x="50%"
          y="35%"
          text-anchor="middle"
          dy="5px"
          fill="currentColor">
          {cantonCode}
        </text>
        <text
          class="s-color-gray-4"
          x="50%"
          y="65%"
          text-anchor="middle"
          dy="5px"
          fill="currentColor">
          --
        </text>
      </g>
    </svg>
  </div>
{:else}
  <div
    class="swiss-hexagon-map-row-element {color.colorClass}"
    style="color: {color.customColor}">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 70 80">
      <path
        shape-rendering="geometricPrecision"
        style="shape-rendering: geometricPrecision"
        stroke="white"
        stroke-width="1"
        fill="currentColor"
        d="M34.64101615137754 0L70 20L70 60L34.64101615137754 80L0 60L0 20Z" />
      <g class="s-font-note">
        <text
          class={getFontColor(color)}
          x="50%"
          y="35%"
          text-anchor="middle"
          dy="5px"
          fill="currentColor">
          {cantonCode}
        </text>
        <text
          class={getFontColor(color)}
          x="50%"
          y="65%"
          text-anchor="middle"
          dy="5px"
          fill="currentColor">
          {value}
        </text>
      </g>
    </svg>
  </div>
{/if}
