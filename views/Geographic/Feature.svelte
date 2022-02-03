<script>
  export let color;
  export let value;
  export let path;
  export let hasAnnotation = false;
  export let isContested = false;
  export let strokeWidth;

  $: fill = value !== null && value !== undefined ? color.customColor && color.customColor.length > 0 ? color.customColor : "currentColor" : "#fff";
  $: stroke = value !== null && value !== undefined ? "#fff" : color.customColor && color.customColor.length > 0 ? color.customColor : "currentColor";
  $: strokeDashArray = isContested ? "2" : "none";
</script>

<g class={color.colorClass}>
  <path
    {fill}
    {stroke}
    stroke-width={strokeWidth}
    stroke-dasharray={strokeDashArray}
    d={path}
  />
  {#if hasAnnotation}
    <path
      class="s-color-gray-9"
      fill="transparent"
      stroke="currentColor"
      stroke-width={strokeWidth + 1}
      stroke-dasharray={strokeDashArray}
      d={path}
    />
  {/if}
</g>
