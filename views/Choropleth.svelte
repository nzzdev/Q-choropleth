<script>
  import HexagonCHCantonsMap from "./Hexagon/HexagonCHCantonsMap.svelte";
  import ChoroplethLegend from "./ChoroplethLegend.svelte";
  import MethodBox from "./MethodBox.svelte";

  export let item;
  export let id;
  export let legendData;
  export let valuesOnMap;
  export let entityMapping;
  export let contentWidth;
  export let methodBoxText;
  export let methodBoxArticle;
  export let displayOptions;
  export let hasFloatingNumbers;
</script>

<div {id} class="s-q-item q-choropleth">
  {#if !displayOptions.hideTitle}
    <h3 class="s-q-item__title">{item.title}</h3>
  {/if}
  {#if item.subtitle}
    <div class="s-q-item__subtitle">{item.subtitle}</div>
  {/if}
  <div id="{id}_container" class="q-choropleth-container">
    {#if !(legendData.type === 'categorical' && valuesOnMap)}
      <ChoroplethLegend {legendData} {contentWidth} />
    {/if}
    {#if item.baseMap === 'hexagonCHCantons'}
      <HexagonCHCantonsMap
        data={item.data}
        {valuesOnMap}
        {legendData}
        {entityMapping}
        {contentWidth}
        {hasFloatingNumbers} />
    {/if}
    {#if legendData.type === 'numerical'}
      <MethodBox {legendData} {methodBoxText} {methodBoxArticle} />
    {/if}
  </div>
</div>
