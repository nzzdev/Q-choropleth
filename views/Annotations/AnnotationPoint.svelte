<script>
  // General props
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
    Why y=4 you ask? Because this makes sure, that the text is vertically
    centered on most common browsers and (!) on QToPrint.
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
