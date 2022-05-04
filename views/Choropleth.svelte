<script>
  import HexagonMap from "./Hexagon/HexagonMap.svelte";
  import GeographicMap from "./Geographic/GeographicMap.svelte";
  import ChoroplethLegend from "./Legend/ChoroplethLegend.svelte";
  import Attribution from "./Attribution.svelte";
  import MethodBox from "./MethodBox.svelte";
  import AnnotationsLegend from "./Annotations/AnnotationsLegend.svelte";
  import { filterAnnotationsFromMiniMaps, getMutatedAnnotations } from "./helpers/annotations";
  import { getRadiusFunction } from "./helpers/bubbleMap.js";
  import { getCssModifier } from "./helpers/cssModifier.js";

  export let item;
  export let legendData;
  export let valuesOnMap;
  export let baseMap;
  export let methodBox;
  export let formattingOptions;
  export let isStatic;
  export let showBubbleMap = false;

  const dataMapping = new Map(item.data);
  const maxHeight = 550;
  const annotations = getMutatedAnnotations(filterAnnotationsFromMiniMaps(item.mapAnnotations, baseMap.miniMaps));
  const annotationRadius = 8;

  let contentWidth;

  $: cssModifier = getCssModifier(contentWidth);
  $: bubbleMapConfig = showBubbleMap
    ? { radiusFor: getRadiusFunction(baseMap, cssModifier) }
    : undefined;
</script>

<div bind:offsetWidth={contentWidth}>
  {#if contentWidth}
    {#if !(legendData.type === "categorical" && valuesOnMap)}
      <ChoroplethLegend
        {bubbleMapConfig}
        {contentWidth}
        {cssModifier}
        {formattingOptions}
        {isStatic}
        {legendData}
      />
    {/if}
    {#if item.baseMap.includes("hexagon")}
      <HexagonMap
        {dataMapping}
        entityType={item.entityType}
        {valuesOnMap}
        {legendData}
        baseMap={baseMap.data}
        {contentWidth}
        {cssModifier}
        {formattingOptions}
        {maxHeight}
        {annotations}
        {annotationRadius}
      />
    {/if}
    {#if item.baseMap.includes("geographic")}
      <div class="choropleth-geographic-container">
        <GeographicMap
          {annotations}
          {annotationRadius}
          {bubbleMapConfig}
          {dataMapping}
          entityType={item.entityType}
          {legendData}
          baseMap={baseMap.data}
          {contentWidth}
          {cssModifier}
          {maxHeight}
        />
        {#if baseMap.mobile && baseMap.mobile.length > 0}
          {#each baseMap.mobile as mobileBaseMap}
            <GeographicMap
              {annotations}
              {annotationRadius}
              {bubbleMapConfig}
              {dataMapping}
              entityType={item.entityType}
              {legendData}
              baseMap={mobileBaseMap.data}
              {contentWidth}
              {cssModifier}
              {maxHeight}
            />
          {/each}
        {/if}
        {#if baseMap.miniMaps && baseMap.miniMaps.length > 0}
          {#each baseMap.miniMaps as miniMap}
            <div
              class="choropleth-geographic-minimap-container"
              style="{miniMap.top ? "top: 0" : "bottom: 0"}; {miniMap.left ? "left: 0" : "right: 0"}; width: {miniMap.width}px;"
            >
              <div class="choropleth-geographic-minimap s-viz-color-nebel">
                <GeographicMap
                  {annotationRadius}
                  {bubbleMapConfig}
                  {dataMapping}
                  entityType={item.entityType}
                  {legendData}
                  baseMap={miniMap.data}
                  contentWidth={miniMap.width}
                  {cssModifier}
                  {maxHeight}
                />
              </div>
              {#if miniMap.title}
                <div class="choropleth-geographic-minimap__title s-font-note-s s-viz-color-regen">
                  {miniMap.title}
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    {/if}
    {#if annotations && annotations.length > 0}
      <AnnotationsLegend {annotations} {annotationRadius} />
    {/if}
    {#if baseMap.data.source}
      <Attribution source={baseMap.data.source} {isStatic} />
    {/if}
    {#if legendData.type === "numerical"}
      <MethodBox
        {legendData}
        {formattingOptions}
        {isStatic}
        methodBoxText={methodBox.text}
        methodBoxArticle={methodBox.article}
      />
    {/if}
  {/if}
</div>

<style>
  .choropleth-geographic-container {
    position: relative;
  }
  
  :global(.choropleth-geographic-minimap-container > .choropleth-geographic-minimap > .svg-container) {
    margin: 0px;
  }

  .choropleth-geographic-minimap-container {
    position: absolute;
  }

  .choropleth-geographic-minimap {
    border: 1px solid currentColor;
    padding: 4px;
  }

  .choropleth-geographic-minimap__title {
    text-align: center;
  }
</style>
