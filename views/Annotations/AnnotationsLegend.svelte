<script>
  import AnnotationPoint from "./AnnotationPoint.svelte";
  
  // General props
  export let annotations = [];

  let radius = 8;
  let svgWidth = (2 * radius + 2);
  let svgHeight = (2 * radius + 2);
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

<div class="q-choropleth-annotations-legend s-font-note" style="display: flex; flex-direction: column; margin: 8px 0 0 0;">
  {#each annotations as { id, name }}
    <div class="q-choropleth-annotation-legend" style="margin: 0 0 4px 0;">
      <svg width={svgWidth} height={svgHeight} style="vertical-align: sub;">
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
      <span>{name}</span>
    </div>
  {/each}
</div>
