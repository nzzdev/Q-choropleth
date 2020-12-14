<script>
  import HexagonMap from "./Hexagon/HexagonMap.svelte";
  import GeographicMap from "./Geographic/GeographicMap.svelte";
  import ChoroplethLegend from "./ChoroplethLegend.svelte";
  import MethodBox from "./MethodBox.svelte";
  import Footer from "./Footer.svelte";

  export let item;
  export let id;
  export let legendData;
  export let valuesOnMap;
  export let baseMap;
  export let contentWidth;
  export let methodBox;
  export let displayOptions;
  export let formattingOptions;
  export let isStatic;

  const dataMapping = new Map(item.data);
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
          {formattingOptions} />
      {/if}
      {#if item.baseMap.includes('geographic')}
        <GeographicMap
          {dataMapping}
          entityType={item.entityType}
          {valuesOnMap}
          {legendData}
          {baseMap}
          {contentWidth}
          {formattingOptions} />
      {/if}
      {#if legendData.type === 'numerical'}
        <MethodBox
          {legendData}
          {formattingOptions}
          {isStatic}
          methodBoxText={methodBox.text}
          methodBoxArticle={methodBox.article} />
      {/if}
    </div>
  {/if}
  <Footer {item} />
</div>
