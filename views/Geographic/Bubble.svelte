<script>
  import { scaleSqrt as d3ScaleSqrt } from "d3-scale";
  
  export let centroid = [0, 0];
  export let color;
  export let config;
  export let hasAnnotation = false;
  export let population = 0;
  export let strokeWidth = 0.8;

  const radiusFor = d3ScaleSqrt()
    .domain([config.populationSize.min, config.populationSize.max])
    .range(config.scaleRange)

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
    fill-opacity=0.9
    stroke={getStrokeColor()}
    stroke-width={strokeWidth}
    transform="translate({centroid[0]},{centroid[1]})"
    r={radiusFor(population)}
  />
  {#if hasAnnotation}
    <circle
      class="s-color-gray-9"
      fill="transparent"
      stroke="currentColor"
      stroke-width=1
      transform="translate({centroid[0]},{centroid[1]})"
      r={radiusFor(population)}
    />
  {/if}
</g>
