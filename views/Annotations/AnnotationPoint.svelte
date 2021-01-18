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
  export let textX = x;
  export let textY = y;
  export let textColor;
  export let fontSize;
</script>

<circle
  r={radius}
  stroke={strokeColor}
  stroke-width={strokeWidth}
  class={colorClass}
  fill={fillColor}
  transform="translate({x}, {y})" />
<g class="s-font-note-s">
  <text
    x={textX}
    y={textY}
    dominant-baseline="middle"
    text-anchor="middle"
    class={textColor}
    font-size={fontSize}
    font-weight=700>
    {id}
  </text>
</g>
