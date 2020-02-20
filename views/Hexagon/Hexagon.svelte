<script>
  export let type;
  export let cantonCode;
  export let value;
  export let color;

  function getFontColor(color) {
    if (color === "s-color-gray-4") {
      return "s-color-gray-6";
    }
    let colorSplit = color.split("-");
    let colorIntensity = colorSplit[colorSplit.length - 1];

    if (colorSplit.includes("diverging")) {
      return colorIntensity > 3 && colorIntensity < 8
        ? "s-color-gray-9"
        : "s-color-gray-1";
    }
    return colorIntensity < 4 ? "s-color-gray-1" : "s-color-gray-9";
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
{:else if value === null}
  <div class="swiss-hexagon-map-row-element {color}">
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
          class="s-color-gray-6"
          x="50%"
          y="50%"
          text-anchor="middle"
          dy="5px"
          fill="currentColor">
          {cantonCode}
        </text>
      </g>
    </svg>
  </div>
{:else}
  <div class="swiss-hexagon-map-row-element {color}">
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
          y="50%"
          text-anchor="middle"
          dy="5px"
          fill="currentColor">
          {cantonCode}
        </text>
      </g>
    </svg>
  </div>
{/if}
