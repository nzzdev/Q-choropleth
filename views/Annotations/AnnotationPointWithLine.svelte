<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";
  import AnnotationLine from "./AnnotationLine.svelte";
  import { round } from "../helpers/data.js";

  export let id = 0;
  export let radius = 8;
  export let coordinates = [];

  let x, y;
  $: {
    x = round(coordinates.x);
    y = round(coordinates.y);
  }
</script>

<g>
  <AnnotationLine {coordinates} />
  <AnnotationPoint
    circleColorClass={"s-color-gray-7"}
    {id}
    {radius}
    textColorClass={"s-color-gray-7"}
    {x}
    {y}
  />
</g>
