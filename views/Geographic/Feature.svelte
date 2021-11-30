<script>
  export let color;
  export let value;
  export let path;
  export let hasAnnotation = false;
  export let strokeWidth;
</script>

<g class={color.colorClass}>
  {#if value !== null && value !== undefined}
    <path
      fill={color.customColor && color.customColor.length > 0
        ? color.customColor
        : "currentColor"}
      stroke="#fff"
      stroke-width={strokeWidth}
      d={path}
    />
  {:else}
    <path
      fill="#fff"
      stroke={color.customColor && color.customColor.length > 0
        ? color.customColor
        : "currentColor"}
      stroke-width={strokeWidth}
      d={path}
    />
  {/if}
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
