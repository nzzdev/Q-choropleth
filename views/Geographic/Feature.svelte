<script>
  export let color = {};
  export let value = undefined;
  export let path;
  export let hasAnnotation = false;
  export let showBubbleMap = false;
  export let strokeWidth = 0.4;

  function getFillColor() {
    if (!value)
      return "#f5f5f5";
    if (color.customColor && color.customColor.length > 0)
      return color.customColor;
    return "currentColor";
  }

  function getStrokeColor() {
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
      stroke-width=1
      d={path}
    />
  {/if}
</g>
