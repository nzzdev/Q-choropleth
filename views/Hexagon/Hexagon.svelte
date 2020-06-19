<script>
  export let type;
  export let cantonCode;
  export let value;
  export let color;
  export let width;
  export let xIndex;
  export let yIndex;

  function getXCoordinate(width, xIndex) {
    return width * xIndex;
  }

  function getYCoordinate(width, yIndex) {
    let height = width * 1.1;
    return (yIndex > 0) ? height * yIndex - ((height/2 - 30) * yIndex) : height * yIndex  ;
  }
</script>

{#if type === 'empty'}
  <svg width={width} height={width*1.1} y={getYCoordinate(width, yIndex)} x={getXCoordinate(width, xIndex)} class="swiss-hexagon-map-row-element" />
{:else if type === 'empty-half'}
  <svg
    y={getYCoordinate(width, yIndex)} x={getXCoordinate(width, xIndex)}
    class="swiss-hexagon-map-row-element swiss-hexagon-map-row-element--half
    s-viz-color-one-5" />
{:else if value === null || value === undefined}
  <svg
    width={width} height={width*1.1}
    y={getYCoordinate(width, yIndex)} x={getXCoordinate(width, xIndex)}
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
  </svg>
{:else}
  <svg
    width={width} height={width*1.1}
    y={getYCoordinate(width, yIndex)} x={getXCoordinate(width, xIndex)}
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
          class={color.textColor}
          x="50%"
          y="35%"
          text-anchor="middle"
          dy="5px"
          fill="currentColor">
          {cantonCode}
        </text>
        <text
          class={color.textColor}
          x="50%"
          y="65%"
          text-anchor="middle"
          dy="5px"
          fill="currentColor">
          {value}
        </text>
      </g>
    </svg>
  </svg>
{/if}
