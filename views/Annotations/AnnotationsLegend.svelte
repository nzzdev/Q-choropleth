<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";
  
  // General props
  export let annotations = [];
  export let annotationRadius = 8;
  
  let x = (annotationRadius + 1);
  let y = (annotationRadius + 1);
</script>

<div class="q-choropleth-legend-annotations s-font-note" style="display: flex; flex-direction: column;">
  {#each annotations as { id, annotation }}
    <div class="q-choropleth-legend-annotation" style="display: flex; flex-direction: row; margin-top: 4px;">
      <div style="height: 18px; width: 18px; margin-right: 4px;">
        <svg width=18 height=18 viewBox="0 0 18 18">
          <AnnotationPoint
            {id}
            radius = {annotationRadius}
            {x}
            {y} />
        </svg>
      </div>
      <div>{annotation}</div>
    </div>
  {/each}
</div>
