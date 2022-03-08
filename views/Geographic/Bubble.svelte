<script>
  import { scaleSqrt as d3ScaleSqrt } from "d3-scale";
  
  export let color;
  export let centroid = [0, 0];
  export let cssModifier;
  export let hasAnnotation = false;
  export let population = 0;
  export let strokeWidth;
  export let value;

  const radiusFor = d3ScaleSqrt()
    .domain([140, 1379302771]) // TODO: get max value from data
    .range([1.5, cssModifier === "narrow" ? 19 : 25])

  function getFillColor() {
    if (!value)
      return "#fff";
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
  <circle
    fill={getFillColor()}
    opacity=0.9
    stroke={getStrokeColor()}
    transform="translate({centroid[0]},{centroid[1]})"
    r={radiusFor(population)}
  />
  {#if hasAnnotation}
    <circle
      class="s-color-gray-9"
      fill="transparent"
      stroke="currentColor"
      stroke-width={strokeWidth + 1}
      transform="translate({centroid[0]},{centroid[1]})"
      r={radiusFor(population)}
    />
  {/if}
</g>
