<script>
  import AnnotationLine from "./AnnotationLine.svelte";
  import { getConnectionLineCoordinates } from "../helpers/annotations";
  import Annotation from "./Annotation.svelte";

  export let regions;
  export let annotationPosition;
  export let annotationRadius;
  export let cssModifier;

  let coordinates = getConnectionLineCoordinates(
    regions,
    annotationPosition,
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
      return `m ${coordinates.lineX2 + 0.5} ${coordinates.lineY2} q ${
        annotationRadius - 0.5
      } 0 ${annotationRadius - 0.5} ${annotationRadius - 0.5}`;
    } else if (
      annotationPosition === "bottom" ||
      (cssModifier === "narrow" && annotationPosition === "right")
    ) {
      return `m ${coordinates.lineX2 + 0.5} ${coordinates.lineY2} q ${
        annotationRadius - 0.5
      } 0 ${annotationRadius - 0.5} ${-Math.abs(annotationRadius - 0.5)}`;
    } else if (annotationPosition === "left") {
      return `m ${coordinates.lineX1} ${coordinates.lineY2 + 0.5} q 0 ${
        annotationRadius - 0.5
      } ${annotationRadius - 0.5} ${annotationRadius - 0.5}`;
    } else if (annotationPosition === "right") {
      return `m ${coordinates.lineX1} ${coordinates.lineY2 + 0.5} q 0 ${
        annotationRadius - 0.5
      } ${-Math.abs(annotationRadius - 0.5)} ${annotationRadius - 0.5}`;
    }
  }
</script>

<g>
  <AnnotationLine {coordinates} />
  <path
    d={getPath(coordinates, annotationRadius, annotationPosition, cssModifier)}
    fill="none"
    stroke="#6e6e7e"
    stroke-width="1"
    stroke-dasharray="1.1"
  />
</g>
