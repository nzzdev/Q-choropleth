<script>
  export let color;
  export let path;
  export let hasAnnotation = false;
</script>

<g class={color.colorClass}>
  <path
    fill={color.customColor && color.customColor.length > 0
      ? color.customColor
      : "currentColor"}
    stroke="#fff"
    stroke-width="0.2"
    d={path}
  />
  {#if hasAnnotation}
    <path
      class="s-color-gray-9"
      fill="transparent"
      stroke="currentColor"
      stroke-width="1.2"
      d={path}
    />
  {/if}
</g>
