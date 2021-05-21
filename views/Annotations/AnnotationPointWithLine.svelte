<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";
  import { round } from "../helpers/data.js";

  export let id = 0;
  export let radius = 8;
  export let coordinates = [];

  let x, y, lineX1, lineY1, lineX2, lineY2;
  $: {
    x = round(coordinates.x);
    y = round(coordinates.y);

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
    stroke="#000"
    stroke-width="1"
    stroke-dasharray="2.5"
  />
  <AnnotationPoint {id} {radius} {x} {y} />
</g>
