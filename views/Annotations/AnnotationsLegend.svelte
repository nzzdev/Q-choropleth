<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";

  export let annotations = [];
  export let annotationRadius = 8;

  let x = (annotationRadius + 1);
  let y = (annotationRadius + 1);
</script>

<div class="s-q-item__legend-annotations s-font-note">
  {#each annotations as { id, annotation }}
    <div class="s-q-item__legend-annotation">
      <div class="s-q-item__legend-annotation__icon">
        <svg width=18 height=18 viewBox="0 0 18 18">
          <AnnotationPoint
            {id}
            radius = {annotationRadius}
            {x}
            {y} />
        </svg>
      </div>
      <div class="s-q-item__legend-annotation__label">{annotation}</div>
    </div>
  {/each}
</div>
