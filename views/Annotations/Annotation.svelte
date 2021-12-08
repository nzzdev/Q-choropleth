<script>
  import AnnotationPointWithLine from "./AnnotationPointWithLine.svelte";
  import AnnotationLine from "./AnnotationLine.svelte";
  export let index;
  export let annotationRadius;
  export let coordinates;
  export let annotationPosition;
  export let cssModifier;
  export let hasMultipleAnnotations;
  export let isLastItem;

  function moveToConnectionLine(
    coordinates,
    annotationRadius,
    annotationPosition,
    cssModifier
  ) {
    if (
      annotationPosition === "top" ||
      (cssModifier === "narrow" && annotationPosition === "left")
    ) {
      coordinates.lineY1 -= annotationRadius - 1;
    } else if (
      annotationPosition === "bottom" ||
      (cssModifier === "narrow" && annotationPosition === "right")
    ) {
      coordinates.lineY1 += annotationRadius - 1;
    } else if (annotationPosition === "left") {
      coordinates.lineX1 -= annotationRadius - 1;
    } else if (annotationPosition === "right") {
      coordinates.lineX2 += annotationRadius - 1;
    }
    return coordinates;
  }
</script>

{#if hasMultipleAnnotations}
  {#if index === 0}
    <AnnotationPointWithLine id={index + 1} {annotationRadius} {coordinates} />
  {:else if !isLastItem}
    <AnnotationLine
      coordinates={moveToConnectionLine(
        coordinates,
        annotationRadius,
        annotationPosition,
        cssModifier
      )}
    />
  {:else}
    <AnnotationLine {coordinates} />
  {/if}
{:else}
  <AnnotationPointWithLine id={index + 1} {annotationRadius} {coordinates} />
{/if}
