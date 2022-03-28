<script>
  import HexagonMap from "./Hexagon/HexagonMap.svelte";
  import GeographicMap from "./Geographic/GeographicMap.svelte";
  import ChoroplethLegend from "./ChoroplethLegend.svelte";
  import Attribution from "./Attribution.svelte";
  import MethodBox from "./MethodBox.svelte";
  import AnnotationsLegend from "./Annotations/AnnotationsLegend.svelte";
  import { getPopulationSize } from "./helpers/bubbleMap.js";

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
  const annotations = getMutatedAnnotations(item.mapAnnotations);
  const annotationRadius = 8;
  const bubbleMapConfig = showBubbleMap
    ? { populationSize: getPopulationSize(baseMap), }
    : undefined;

  let contentWidth;

  function getMutatedAnnotations(mapAnnotations) {
    if (!mapAnnotations) return [];
    return mapAnnotations.map((value, index) => {
      value.id = index + 1;
      value.regions = value.regions.map((region) => {
        return { id: region };
      });
      return value;
    });
  }
</script>

<div bind:offsetWidth={contentWidth}>
  {#if contentWidth}
    {#if !(legendData.type === "categorical" && valuesOnMap)}
      <ChoroplethLegend
        {legendData}
        {formattingOptions}
        {contentWidth}
        {isStatic}
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
              {maxHeight}
            />
          {/each}
        {/if}
        {#if baseMap.miniMaps && baseMap.miniMaps.length > 0}
          {#each baseMap.miniMaps as miniMap}
            <div
              class="choropleth-geographic-minimap"
              style="{miniMap.top ? "top: 0" : "bottom: 0"}; {miniMap.left ? "left: 0" : "right: 0"}; width: {miniMap.width}px;"
            >
              <GeographicMap
                {annotations}
                {annotationRadius}
                {bubbleMapConfig}
                {dataMapping}
                entityType={item.entityType}
                {legendData}
                baseMap={miniMap.data}
                contentWidth={miniMap.width}
                {maxHeight}
              />
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

  .choropleth-geographic-minimap {
    border: 1px solid silver;
    position: absolute;
  }
</style>
