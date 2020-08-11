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
  export let formattingOptions;
</script>

<div id="{id}_container" class="s-q-item q-choropleth">
  {#if !displayOptions.hideTitle}
    <h3 class="s-q-item__title">{item.title}</h3>
  {/if}
  {#if item.subtitle || item.subtitleSuffix}
    <div class="s-q-item__subtitle">
      {#if item.subtitle}{item.subtitle}{/if}
      {#if item.subtitleSuffix}{item.subtitleSuffix}{/if}
    </div>
  {/if}
  {#if contentWidth}
    <div class="q-choropleth-container">
      {#if !(legendData.type === 'categorical' && valuesOnMap)}
        <ChoroplethLegend {legendData} {formattingOptions} {contentWidth} />
      {/if}
      {#if item.baseMap === 'hexagonCHCantons'}
        <HexagonCHCantonsMap
          data={item.data}
          entityType={item.entityType}
          {valuesOnMap}
          {legendData}
          {entityMapping}
          {contentWidth}
          {formattingOptions} />
      {/if}
      {#if legendData.type === 'numerical'}
        <MethodBox
          {legendData}
          {formattingOptions}
          {methodBoxText}
          {methodBoxArticle} />
      {/if}
    </div>
  {/if}
</div>
