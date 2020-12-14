<script>
  export let color;
  export let path;
</script>

<g class={color.colorClass}>
  <path
    class="q-choropleth-feature"
    fill={color.customColor && color.customColor.length > 0 ? color.customColor : 'currentColor'}
    stroke="#fff"
    stroke-width="0.5px"
    d={path} />
</g>
