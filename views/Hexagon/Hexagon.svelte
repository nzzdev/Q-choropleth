<script>
  import { sizeFromWidth, pointyHexCorners } from "../helpers/hexagon.js";

  export let valuesOnMap;
  export let text;
  export let fontSize;
  export let color;
  export let width;
  export let height;
  export let type;
  export let x;
  export let y;
  export let growFactor;

  const transform = `translate(${x} ${y})`;
  const points = getPolygonPoints(x, y, width, growFactor);

  function getPolygonPoints(x, y, width, growFactor) {
    const size = sizeFromWidth(width);
    const center = { x: width / 2, y: size };
    const corners = pointyHexCorners(center, size * growFactor);
    return corners.map(({ x, y }) => `${x},${y}`).join(" ");
  }
</script>

<<<<<<< HEAD
{#if type === 'fill'}
  <polygon
    {transform}
    {points}
    class={color.colorClass}
    fill={color.customColor && color.customColor.length > 0 ? color.customColor : 'currentColor'} />
  <g class="s-font-note-s">
    {#if valuesOnMap}
      <text
        x={x + width / 2}
        y={y + height / 3}
        dy="0.5"
        dominant-baseline="middle"
        text-anchor="middle"
        class={color.textColor}
        fill="currentColor"
        font-size={fontSize}>
        {text[0]}
      </text>
      <text
        x={x + width / 2}
        y={y + (2 * height) / 3}
        dominant-baseline="middle"
        text-anchor="middle"
        class="{color.textColor} q-choropleth-hexagon-value"
        fill="currentColor"
        font-size={fontSize}>
        {text[1]}
      </text>
    {:else}
      <text
        x={x + width / 2}
        y={y + height / 2}
        dominant-baseline="middle"
        text-anchor="middle"
        class={color.textColor}
        fill="currentColor"
        font-size={fontSize}>
        {text[0]}
      </text>
    {/if}
  </g>
=======
{#if value === null || value === undefined}
  <svg
    width="{width}px"
    height="{width * 1.2}px"
    x="{getXCoordinate(width, xIndex)}px"
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
        {#if valuesOnMap}
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
            class="s-color-gray-4 swiss-hexagon-value"
            x="50%"
            y="65%"
            text-anchor="middle"
            dy="5px"
            fill="currentColor">
            --
          </text>
        {:else}
          <text
            class="s-color-gray-4"
            x="50%"
            y="50%"
            text-anchor="middle"
            dy="5px"
            fill="currentColor">
            {cantonCode}
          </text>
        {/if}
      </g>
    </svg>
  </svg>
>>>>>>> added class to hexagon-value
{:else}
  <polygon
    {transform}
    {points}
    class={color.colorClass}
    fill="#fff"
    stroke="currentColor"
    stroke-width="0.1" />
  <g class="s-font-note-s">
    {#if valuesOnMap}
      <text
        x={x + width / 2}
        y={y + height / 3}
        dy="0.5"
        dominant-baseline="middle"
        text-anchor="middle"
        class="s-color-gray-4"
        fill="currentColor"
        font-size={fontSize}>
        {text[0]}
      </text>
      <text
        x={x + width / 2}
        y={y + (2 * height) / 3}
        dominant-baseline="middle"
        text-anchor="middle"
        class={color.textColor}
        fill="currentColor"
        font-size={fontSize}>
        --
      </text>
    {:else}
      <text
        x={x + width / 2}
        y={y + height / 2}
        dominant-baseline="middle"
        text-anchor="middle"
        class="s-color-gray-4"
        fill="currentColor"
<<<<<<< HEAD
        font-size={fontSize}>
        {text[0]}
      </text>
    {/if}
  </g>
=======
        d="M34.64101615137754 0L70 20L70 60L34.64101615137754 80L0 60L0 20Z" />
      <g class="s-font-note">
        {#if valuesOnMap}
          <text
            class={color.textColor}
            x="50%"
            y="35%"
            text-anchor="middle"
            font-size="{fontSize}em"
            dy="5px"
            fill="currentColor">
            {cantonCode}
          </text>
          <text
            class="{color.textColor} swiss-hexagon-value"
            x="50%"
            y="65%"
            text-anchor="middle"
            font-size="{fontSize}em"
            dy="5px"
            fill="currentColor">
            {value}
          </text>
        {:else}
          <text
            class={color.textColor}
            x="50%"
            y="50%"
            text-anchor="middle"
            font-size="{fontSize}em"
            dy="5px"
            fill="currentColor">
            {cantonCode}
          </text>
        {/if}
      </g>
    </svg>
  </svg>
>>>>>>> added class to hexagon-value
{/if}
