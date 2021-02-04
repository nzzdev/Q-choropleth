<script>
  export let id = 0;
  export let radius = 8;
  export let x;
  export let y;

  // Circle props
  export let strokeWidth = 1;
  export let circleColorClass;

  // Text props
  export let textColorClass;
</script>

<g class="s-font-note-s" transform="translate({x}, {y})">
  <circle
    r={radius}
    class={circleColorClass}
    fill={circleColorClass ? "currentColor" : "#fff"}
    stroke="#000"
    stroke-width={strokeWidth} />
  <!--
    y=4 to vertically center text (important for QToPrint)
  -->
  <text
    y=4
    class={textColorClass}
    fill="currentColor"
    font-weight=700
    text-anchor="middle">
    {id}
  </text>
</g>
