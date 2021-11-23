<script>
  import { round } from "../helpers/data.js";
  export let coordinates = [];

  let lineX1, lineY1, lineX2, lineY2;
  $: {
    // Line props
    lineX1 = round(coordinates.lineX1);
    lineY1 = round(coordinates.lineY1);
    lineX2 = round(coordinates.lineX2);
    lineY2 = round(coordinates.lineY2);
  }
</script>

<g>
  <line
    x1={lineX1}
    y1={lineY1}
    x2={lineX2}
    y2={lineY2}
    fill="none"
    stroke="#6e6e7e"
    stroke-width="1"
    stroke-dasharray="1.1"
  />
</g>
