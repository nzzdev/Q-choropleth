<script>
  import { scaleSqrt as d3ScaleSqrt } from "d3-scale";
  
  export let color;
  export let centroid;
  export let hasAnnotation = false;
  export let population;
  export let strokeWidth;
  export let value;

  $: fill = value !== null && value !== undefined
    ? color.customColor && color.customColor.length > 0
      ? color.customColor
      : "currentColor"
    : "#fff";
  $: stroke = value !== null && value !== undefined
    ? "#fff"
      : color.customColor && color.customColor.length > 0
        ? color.customColor
        : "currentColor";
  const radiusFor = d3ScaleSqrt()
    .domain([140, 1379302771])
    .range([1.5, 75])
</script>

<g class={color.colorClass}>
  <circle
    {fill}
    opacity=0.95
    {stroke}
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
