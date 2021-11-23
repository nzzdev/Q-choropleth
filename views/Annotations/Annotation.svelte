<script>
  import AnnotationPointWithLine from "./AnnotationPointWithLine.svelte";
  import AnnotationLine from "./AnnotationLine.svelte";
  export let id;
  export let index;
  export let hasMultipleAnnotations;
  export let radius;
  export let coordinates;
</script>

{#if hasMultipleAnnotations}
  {#if index === 0}
    <AnnotationPointWithLine {id} {radius} {coordinates} />
  {:else}
    <AnnotationLine {coordinates} />
  {/if}
{:else}
  <AnnotationPointWithLine {id} {radius} {coordinates} />
{/if}
