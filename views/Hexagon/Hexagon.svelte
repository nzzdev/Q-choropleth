<script>
  import { sizeFromWidth, pointyHexCorners } from "../helpers/hexagon.js";
  import { roundCoordinatesInPath } from "../helpers/geo.js";

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
  export let cssModifier;
  export let hasAnnotation = false;

  const transform = `translate(${x} ${y})`;
  const points = roundCoordinatesInPath(
    getPolygonPoints(x, y, width, growFactor),
    1
  );
  const fontNoteClass = (cssModifier === "narrow" ? "s-font-note-s" : "s-font-note");

  function getPolygonPoints(x, y, width, growFactor) {
    const size = sizeFromWidth(width);
    const center = { x: width / 2, y: size };
    const corners = pointyHexCorners(center, size * growFactor);
    return corners.map(({ x, y }) => `${x},${y}`).join(" ");
  }

  function getCantonTextY(y, height) {
    let coordinate = y + height / 3;
    if (cssModifier === "wide") {
      return coordinate + 0.4;
    } else if (cssModifier === "wide-plus" || cssModifier === "extra-wide") {
      return coordinate + 0.6;
    } else {
      // narrow
      return coordinate;
    }
  }

  function getValueTextY(y, height) {
    let coordinate = y + (2 * height) / 3;
    if (cssModifier === "wide") {
      return coordinate - 0.4;
    } else if (cssModifier === "wide-plus" || cssModifier === "extra-wide") {
      return coordinate - 0.6;
    } else {
      // narrow
      return coordinate;
    }
  }
</script>

{#if type === 'fill'}
  <polygon
    {transform}
    {points}
    class={color.colorClass}
    fill={color.customColor && color.customColor.length > 0 ? color.customColor : 'currentColor'}
    stroke={hasAnnotation ? "#000000" : undefined}
    stroke-width={hasAnnotation ? "1" : undefined} />
  <g class={fontNoteClass}>
    {#if valuesOnMap}
      <text
        x={x + width / 2}
        y={getCantonTextY(y, height)}
        dy="0.5"
        dominant-baseline="central"
        text-anchor="middle"
        class={color.textColor}
        fill="currentColor"
        font-size={fontSize}>
        {text[0]}
      </text>
      <text
        x={x + width / 2}
        y={getValueTextY(y, height)}
        dominant-baseline="central"
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
        dominant-baseline="central"
        text-anchor="middle"
        class={color.textColor}
        fill="currentColor"
        font-size={fontSize}>
        {text[0]}
      </text>
    {/if}
  </g>
{:else}
  <polygon
    {transform}
    {points}
    class={color.colorClass}
    fill="#fff"
    stroke={hasAnnotation ? "#000000" : "currentColor"}
    stroke-width={hasAnnotation ? "1" : "0.4"} />
  <g class={fontNoteClass}>
    {#if valuesOnMap}
      <text
        x={x + width / 2}
        y={getCantonTextY(y, height)}
        dy="0.5"
        dominant-baseline="central"
        text-anchor="middle"
        class="s-color-gray-4"
        fill="currentColor"
        font-size={fontSize}>
        {text[0]}
      </text>
      <text
        x={x + width / 2}
        y={getValueTextY(y, height)}
        dominant-baseline="central"
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
        dominant-baseline="central"
        text-anchor="middle"
        class="s-color-gray-4"
        fill="currentColor"
        font-size={fontSize}>
        {text[0]}
      </text>
    {/if}
  </g>
{/if}
