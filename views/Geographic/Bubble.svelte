<script>
  export let centroid = [0, 0];
  export let color;
  export let config;
  export let cssModifier;
  export let hasAnnotation = false;
  export let hasValue = false;
  export let population = 0;
  export let strokeWidth = 0.8;

  const fillOpacity = config ? 0.8 : 1; // if we have a bubble map, we render the bubble a bit more transparent (aesthetic reasons)
  const radius = config?.radiusFor(population) ?? (cssModifier === "narrow" ? 4.5 : 6);

  function getFillColor() {
    if (!hasValue)
      return "#f5f5f5";
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
    fill-opacity={fillOpacity}
    stroke={getStrokeColor()}
    stroke-width={strokeWidth}
    transform="translate({centroid[0]},{centroid[1]})"
    r={radius}
  />
  {#if hasAnnotation}
    <circle
      class="s-color-gray-9"
      fill="transparent"
      stroke="currentColor"
      stroke-width=1
      transform="translate({centroid[0]},{centroid[1]})"
      r={radius}
    />
  {/if}
</g>
