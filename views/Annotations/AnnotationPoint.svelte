<script>
  import { RADIUS } from "../helpers/annotations";

  export let id = 0;
  export let radius = RADIUS;
  export let x;
  export let y;

  // Circle props
  export let strokeWidth = 1;
  export let circleColorClass;

  // Text props
  export let textColorClass;
</script>

<g class="s-font-note-s">
  <circle
    r={radius}
    cx={x}
    cy={y}
    class={circleColorClass}
    fill="white"
    stroke="currentColor"
    stroke-width={strokeWidth}
    />
  <!--
    y=0.35em to vertically center text (important for QToPrint)
  -->
  <text
    y="0.35em"
    dx={x}
    dy={y}
    class={textColorClass}
    fill="currentColor"
    font-weight="700"
    text-anchor="middle"
    >
    {id}
  </text>
</g>
