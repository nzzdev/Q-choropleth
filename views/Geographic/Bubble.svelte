<script>
  export let centroid = [0, 0];
  export let color;
  export let config;
  export let hasAnnotation = false;
  export let population = 0;
  export let strokeWidth = 0.8;

  function getFillColor() {
    if (color.customColor && color.customColor.length > 0)
      return color.customColor;
    return "currentColor";
  }

  function getStrokeColor() {
    return "#707070";
  }
</script>

<g class={color.colorClass}>
  <circle
    fill={getFillColor()}
    fill-opacity=0.8
    stroke={getStrokeColor()}
    stroke-width={strokeWidth}
    transform="translate({centroid[0]},{centroid[1]})"
    r={config?.radiusFor(population) || 6}
  />
  {#if hasAnnotation}
    <circle
      class="s-color-gray-9"
      fill="transparent"
      stroke="currentColor"
      stroke-width=1
      transform="translate({centroid[0]},{centroid[1]})"
      r={config?.radiusFor(population) || 6}
    />
  {/if}
</g>
