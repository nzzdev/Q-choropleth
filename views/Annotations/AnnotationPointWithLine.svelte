<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";
  import { round } from "../helpers/data.js";

  // General props
  export let id = 0;
  export let radius = 0;
  export let coordinates = [];

  let x = round(coordinates.x);
  let y = round(coordinates.y);

  // AnnotationPoint props
  export let strokeColor = "black";
  export let strokeWidth;
  export let colorClass = "s-color-gray-4";
  export let fillColor = "white";
  export let textColor = "s-color-gray-4";
  export let fontSize;

  // Line props
  export let strokeDashArray;

  let lineX1 = round(coordinates.lineX1);
  let lineY1 = round(coordinates.lineY1);
  let lineX2 = round(coordinates.lineX2);
  let lineY2 = round(coordinates.lineY2);
</script>

<g class="q-choropleth-annotation">
  <AnnotationPoint
    {id}
    {radius}
    {x}
    {y}
    {strokeColor}
    {strokeWidth}
    {colorClass}
    {fillColor}
    {textColor}
    {fontSize} />
  <line
    x1={lineX1}
    y1={lineY1}
    x2={lineX2}
    y2={lineY2}
    stroke={strokeColor}
    stroke-width={strokeWidth}
    stroke-dasharray={strokeDashArray}>
  </line>
</g>
