<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";

  // General props
  export let id = 0;
  export let radius = 0;
  export let coordinates = [];

  let x = coordinates.x;
  let y = coordinates.y;

  // AnnotationPoint props
  export let strokeColor = "black";
  export let strokeWidth;
  export let colorClass = "s-color-gray-4";
  export let fillColor = "white";
  export let textColor = "s-color-gray-4";
  export let fontSize;

  // Line props
  export let strokeDashArray;

  let lineX1 = coordinates.lineX1;
  let lineY1 = coordinates.lineY1;
  let lineX2 = coordinates.lineX2;
  let lineY2 = coordinates.lineY2;
</script>

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
