<script>
  import HexagonCHCantonsMap from "./Hexagon/HexagonCHCantonsMap.svelte";
  import ChoroplethLegend from "./ChoroplethLegend.svelte";
  import MethodBox from "./MethodBox.svelte";

  export let item;
  export let id;
  export let legendData;
  export let valuesOnMap;
  export let entityCollectionInfo;
  export let contentWidth;
  export let methodBox;
  export let displayOptions;
  export let formattingOptions;
  export let noInteraction;
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
        <ChoroplethLegend
          {legendData}
          {formattingOptions}
          {contentWidth}
          {noInteraction} />
      {/if}
      {#if item.baseMap === 'hexagonCHCantons'}
        <HexagonCHCantonsMap
          data={item.data}
          entityType={item.entityType}
          {valuesOnMap}
          {legendData}
          {entityCollectionInfo}
          {contentWidth}
          {formattingOptions} />
      {/if}
      {#if legendData.type === 'numerical'}
        <MethodBox
          {legendData}
          {formattingOptions}
          {noInteraction}
          methodBoxText={methodBox.text}
          methodBoxArticle={methodBox.article} />
      {/if}
    </div>
  {/if}
</div>
