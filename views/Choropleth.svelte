<script>
  import HexagonCHCantonsMap from "./Hexagon/HexagonCHCantonsMap.svelte";
  import ChoroplethLegend from "./ChoroplethLegend.svelte";
  import MethodBox from "./MethodBox.svelte";

  export let item;
  export let id;
  export let legendData;
  export let entityMapping;
  export let contentWidth;
</script>

<div {id} class="s-q-item q-choropleth">
  <h3 class="s-q-item__title">{item.title}</h3>
  {#if item.subtitle}
    <div class="s-q-item__subtitle">{item.subtitle}</div>
  {/if}
  <div id="{id}_container" class="q-choropleth-container">
    <ChoroplethLegend {legendData} />
    {#if item.baseMap === 'hexagonCHCantons'}
      <HexagonCHCantonsMap
        data={item.data}
        {legendData}
        {entityMapping}
        {contentWidth} />
    {/if}
    {#if legendData.type === 'numerical'}
      <MethodBox {legendData} />
    {/if}
  </div>
</div>
