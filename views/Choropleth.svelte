<script>
  import HexagonCHCantonsMap from "./Hexagon/HexagonCHCantonsMap.svelte";
  import ChoroplethLegend from "./ChoroplethLegend.svelte";

  export let item;
  export let legendData;
</script>

<div class="s-q-item q-choropleth">
  <h3 class="s-q-item__title">{item.title}</h3>
  <div class="s-q-item__subtitle">{item.subtitle}</div>
  <ChoroplethLegend {legendData} />
  {#if item.basemap === 'hexagonCHCantons'}
    <HexagonCHCantonsMap data={item.data} {legendData} />
  {/if}
</div>
