<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";

  export let annotations = [];
  export let annotationRadius = 8;

  let x = "50%";
  let y = "50%";
</script>

<div class="s-q-item__legend-annotations s-font-note">
  {#each annotations as { id, annotation }}
    <div class="s-q-item__legend-annotation">
      <div class="s-q-item__legend-annotation__icon">
        <svg width="1.4em" height="1.4em">
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
