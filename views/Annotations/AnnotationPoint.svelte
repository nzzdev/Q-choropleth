<script>
  // General props
  export let id = 0;
  export let radius = 0;
  export let x;
  export let y;

  // Circle props
  export let strokeColor = "black";
  export let strokeWidth;
  export let colorClass;
  export let fillColor = "white";

  // Text props
  export let textColor;
  export let fontSize;
</script>

<g class="s-font-note-s" transform="translate({x}, {y})">
  <circle
    r={radius}
    stroke={strokeColor}
    stroke-width={strokeWidth}
    class={colorClass}
    fill={fillColor} />
  <text
    dominant-baseline="central"
    text-anchor="middle"
    class={textColor}
    font-size={fontSize}
    font-weight=700>
    {id}
  </text>
</g>
