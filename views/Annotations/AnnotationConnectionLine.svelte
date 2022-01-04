<script>
  import AnnotationLine from "./AnnotationLine.svelte";
  import { getConnectionLineCoordinates } from "../helpers/annotations";

  export let annotationLine;
  export let annotationRadius;
  export let cssModifier;

  let coordinates = getConnectionLineCoordinates(
    annotationLine,
    annotationLine.position,
    annotationRadius,
    cssModifier
  );

  function getPath(
    coordinates,
    annotationRadius,
    annotationPosition,
    cssModifier
  ) {
    if (
      annotationPosition === "top" ||
      (cssModifier === "narrow" && annotationPosition === "left")
    ) {
      return `m ${coordinates.lineX2} ${coordinates.lineY2} q ${annotationRadius} 0 ${annotationRadius} ${annotationRadius}`;
    } else if (
      annotationPosition === "bottom" ||
      (cssModifier === "narrow" && annotationPosition === "right")
    ) {
      return `m ${coordinates.lineX2} ${
        coordinates.lineY2
      } q ${annotationRadius} 0 ${annotationRadius} ${-Math.abs(
        annotationRadius
      )}`;
    } else if (annotationPosition === "left") {
      return `m ${coordinates.lineX1} ${coordinates.lineY2} q 0 ${annotationRadius} ${annotationRadius} ${annotationRadius}`;
    } else if (annotationPosition === "right") {
      return `m ${coordinates.lineX1} ${
        coordinates.lineY2
      } q 0 ${annotationRadius} ${-Math.abs(
        annotationRadius
      )} ${annotationRadius}`;
    }
  }
</script>

<g>
  <path
    d={getPath(
      coordinates,
      annotationRadius,
      annotationLine.position,
      cssModifier
    )}
    fill="none"
    stroke="#6e6e7e"
    stroke-width="1"
    stroke-dasharray="1.1"
  />
  <AnnotationLine {coordinates} />
</g>
