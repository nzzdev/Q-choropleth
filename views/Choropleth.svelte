<script>
  import HexagonCHCantonsMap from "./Hexagon/HexagonCHCantonsMap.svelte";
  import ChoroplethLegend from "./ChoroplethLegend.svelte";

  export let item;
  export let legendData;
  export let entityMapping;
  export let contentWidth;
</script>

<div class="s-q-item q-choropleth">
  <h3 class="s-q-item__title">{item.title}</h3>
  {#if item.subtitle}
    <div class="s-q-item__subtitle">{item.subtitle}</div>
  {/if}
  <ChoroplethLegend {legendData} />
  {#if item.baseMap === 'hexagonCHCantons'}
    <HexagonCHCantonsMap
      data={item.data}
      {legendData}
      {entityMapping}
      {contentWidth} />
  {/if}
</div>
