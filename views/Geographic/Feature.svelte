<script>
  export let color;
  export let value;
  export let path;
  export let hasAnnotation = false;
  export let strokeWidth;

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
</script>

<g class={color.colorClass}>
  <path
    {fill}
    {stroke}
    stroke-width={strokeWidth}
    d={path}
  />
  {#if hasAnnotation}
    <path
      class="s-color-gray-9"
      fill="transparent"
      stroke="currentColor"
      stroke-width={strokeWidth + 1}
      d={path}
    />
  {/if}
</g>
