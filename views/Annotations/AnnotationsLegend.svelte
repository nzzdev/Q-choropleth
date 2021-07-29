<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";

  export let annotations = [];
  export let annotationRadius = 8;

  let x = "50%";
  let y = "50%";
</script>

<div class="s-q-item__annotation-legend s-font-note">
  {#each annotations as { id, annotation }}
    <div class="s-q-item__annotation-legend__item">
      <div class="s-q-item__annotation-legend__item__icon">
        <svg width="1.4em" height="1.4em">
          <AnnotationPoint
            circleColorClass={"s-color-gray-9"}
            {id}
            radius={annotationRadius}
            textColorClass={"s-color-gray-9"}
            {x}
            {y}
            />
        </svg>
      </div>
      <div class="s-q-item__annotation-legend__item__label">{annotation}</div>
    </div>
  {/each}
</div>
