<script>
  export let color;
  export let value;
  export let path;
  export let hasAnnotation = false;
  export let showBubbleMap = false;
  export let strokeWidth;

  function getFillColor() {
    if (showBubbleMap)
      return "#f5f5f5";
    if (!value)
      return "#fff";
    if (color.customColor && color.customColor.length > 0)
      return color.customColor;
    return "currentColor";
  }

  function getStrokeColor() {
    if (showBubbleMap)
      return "#05032d"; // s-color-gray-9
    if (value)
      return "#fff";
    if (color.customColor && color.customColor.length > 0)
      return color.customColor;
    return "currentColor";
  }
</script>

<g class={color.colorClass}>
  <path
    fill={getFillColor()}
    stroke={getStrokeColor()}
    stroke-width={strokeWidth}
    d={path}
  />
  {#if hasAnnotation && !showBubbleMap}
    <path
      class="s-color-gray-9"
      fill="transparent"
      stroke="currentColor"
      stroke-width={strokeWidth + 1}
      d={path}
    />
  {/if}
</g>
