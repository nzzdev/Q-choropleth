<script>
  export let color;
  export let path;
  export let hasAnnotation = false;
</script>

<g class={color.colorClass}>
  <path
    class="q-choropleth-feature"
    fill={color.customColor && color.customColor.length > 0 ? color.customColor : 'currentColor'}
    stroke={hasAnnotation ? "#000000" : "#fff"}
    stroke-width={hasAnnotation ? "0.9" : "0.3"}
    d={path} />
</g>
