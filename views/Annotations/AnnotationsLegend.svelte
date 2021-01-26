<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";
  
  // General props
  export let annotations = [];

  let radius = 8;
  let x = (radius + 1);
  let y = (radius + 1);
  
  // AnnotationPoint props
  export let strokeColor = "black";
  export let strokeWidth = 1;
  export let colorClass = "s-color-gray-4";
  export let fillColor = "white";
  export let textColor = "s-color-gray-4";
  export let fontSize = "11px";
</script>

<div class="q-choropleth-legend-annotations s-font-note" style="display: flex; flex-direction: column;">
  {#each annotations as { id, name }}
    <div class="q-choropleth-legend-annotation" style="display: flex; flex-direction: row; margin-top: 4px;">
      <div style="height: 18px; width: 18px; margin-right: 4px;">
        <svg width=18 height=18 viewBox="0 0 18 18">
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
        </svg>
      </div>
      <div>{name}</div>
    </div>
  {/each}
</div>
