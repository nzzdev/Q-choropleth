<script>
  import HexagonMap from "./Hexagon/HexagonMap.svelte";
  import GeographicMap from "./Geographic/GeographicMap.svelte";
  import ChoroplethLegend from "./ChoroplethLegend.svelte";
  import Attribution from "./Attribution.svelte";
  import MethodBox from "./MethodBox.svelte";
  import AnnotationsLegend from "./Annotations/AnnotationsLegend.svelte";

  export let item;
  export let legendData;
  export let valuesOnMap;
  export let baseMap;
  export let methodBox;
  export let formattingOptions;
  export let isStatic;

  const dataMapping = new Map(item.data);
  const maxHeight = 550;
  const annotations = getAnnotationsWithId(item.mapAnnotations);
  const annotationRadius = 8;
  let contentWidth;

  function getAnnotationsWithId(mapAnnotations) {
    if (!mapAnnotations) return [];
    return mapAnnotations.map((value, index) => {
      value.id = index + 1;
      return value;
    });
  }
</script>

<div bind:offsetWidth={contentWidth}>
{#if contentWidth}
  {#if !(legendData.type === 'categorical' && valuesOnMap)}
    <ChoroplethLegend
      {legendData}
      {formattingOptions}
      {contentWidth}
      {isStatic} />
  {/if}
  {#if item.baseMap.includes('hexagon')}
    <HexagonMap
      {dataMapping}
      entityType={item.entityType}
      {valuesOnMap}
      {legendData}
      {baseMap}
      {contentWidth}
      {formattingOptions}
      {maxHeight}
      {annotations}
      {annotationRadius} />
  {/if}
  {#if item.baseMap.includes('geographic')}
    <GeographicMap
      {dataMapping}
      entityType={item.entityType}
      {legendData}
      {baseMap}
      {contentWidth}
      {maxHeight}
      {annotations}
      {annotationRadius} />
  {/if}
  {#if annotations && annotations.length > 0}
    <AnnotationsLegend
      {annotations}
      {annotationRadius} />
  {/if}
  {#if baseMap.source}
    <Attribution source={baseMap.source} {isStatic}/>
  {/if}
  {#if legendData.type === 'numerical'}
    <MethodBox
      {legendData}
      {formattingOptions}
      {isStatic}
      methodBoxText={methodBox.text}
      methodBoxArticle={methodBox.article} />
  {/if}
{/if}
</div>