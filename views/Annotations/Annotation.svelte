<script>
  import AnnotationPointWithLine from "./AnnotationPointWithLine.svelte";
  import AnnotationLine from "./AnnotationLine.svelte";
  export let id;
  export let index;
  export let hasMultipleAnnotations;
  export let radius;
  export let coordinates;
  export let annotationPosition;
</script>

{#if hasMultipleAnnotations}
  {#if index === 0}
    <AnnotationPointWithLine {id} {radius} {coordinates} />
    {#if annotationPosition === "TOP"}
      <!-- horizontal line-->
    {:else}
      <!-- vertical line -->
    {/if}
  {:else}
    <AnnotationLine {coordinates} />
  {/if}
{:else}
  <AnnotationPointWithLine {id} {radius} {coordinates} />
{/if}
