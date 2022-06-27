<script>
  import HexagonMap from "./Hexagon/HexagonMap.svelte";
  import GeographicMap from "./Geographic/GeographicMap.svelte";
  import ChoroplethLegend from "./Legend/ChoroplethLegend.svelte";
  import Attribution from "./Attribution.svelte";
  import MethodBox from "./MethodBox.svelte";
  import AnnotationsLegend from "./Annotations/AnnotationsLegend.svelte";
  import MiniMap from "./Geographic/MiniMap.svelte";
  import { getMutatedAnnotations } from "./helpers/annotations";
  import { getRadiusFunction } from "./helpers/bubbleMap.js";
  import { getCssModifier } from "./helpers/cssModifier.js";
  import { getGeoParameters } from "./helpers/geo.js";
  import { getAnnotationsForGeoMap } from "./helpers/annotations";
  import { getAspectRatioViewBox } from "./helpers/svg.js";
  import { round } from "./helpers/data.js";
  import Annotation from "./Annotations/Annotation.svelte";
  import AnnotationConnectionLine from "./Annotations/AnnotationConnectionLine.svelte";

  export let item;
  export let legendData;
  export let valuesOnMap;
  export let baseMap;
  export let measuringUnit;
  export let methodBox;
  export let formattingOptions;
  export let isStatic;
  export let showBubbleMap = false;

  const baseMaps = [];
  const miniMaps = [];
  const dataMapping = new Map(item.data);
  const maxHeight = 550;
  const annotations = getMutatedAnnotations(item.mapAnnotations);
  const annotationRadius = 8;
  const annotationStartPosition = annotationRadius * 2;

  let bubbleMapConfig, contentWidth, cssModifier;
  
  function getSvgSize(bounds, contentWidth, annotations, annotationSpace) {
    if (!bounds) return { aspectRatio: 1, viewBox: [0, 0, contentWidth, maxHeight] };
    let xMin = bounds[0][0];
    let yMin = bounds[0][1];
    let width = bounds[1][0];
    let height = round(bounds[1][1]);
    let retVal = getAspectRatioViewBox(
      xMin,
      yMin,
      width,
      height,
      contentWidth,
      annotations,
      annotationSpace
    );
    return retVal;
  }

  $: if (item.baseMap.includes("geographic") && contentWidth) {
    cssModifier = getCssModifier(contentWidth);
    bubbleMapConfig = showBubbleMap
      ? { radiusFor: getRadiusFunction(baseMap, cssModifier) }
      : undefined;

    baseMaps.push(...getBaseMaps(
      baseMap.data,
      contentWidth,
      maxHeight
    ));

    if (baseMap.mobile) {
      for (const mobileMap of baseMap.mobile) {
        baseMaps.push(...getBaseMaps(mobileMap.data, contentWidth, maxHeight));
      }
    }
    if (baseMap.miniMaps) {
      for (const miniMap of baseMap.miniMaps) {
        miniMaps.push(
          ...getBaseMaps(
            miniMap.data,
            miniMap.width,
            maxHeight,
            { top: miniMap.top, left: miniMap.left, title: miniMap.title },
            miniMap.top ? baseMaps[0] : baseMaps[baseMaps.length - 1]
          )
        );
      }
    }
  }

  function getBaseMaps(baseMap, contentWidth, maxHeight, config, parentMap) {
    const retVal = [];
    const geoParameters = getGeoParameters(
      baseMap,
      cssModifier === "narrow" || parentMap ? contentWidth : contentWidth - 50,
      maxHeight
    ); // contentWidth - 2*24+2 on desktop AND annotations on left/right
    const annotationLines = getAnnotationsForGeoMap(
      annotations,
      geoParameters,
      item.entityType,
      annotationStartPosition,
      cssModifier
    );
    let parentMapViewBox, svgSize;

    if (parentMap) {
      parentMapViewBox = parentMap.svgSize.viewBox;
      svgSize = getSvgSize(geoParameters?.bounds, contentWidth, []);
    } else {
      // TODO: add check, if annotations really there
      svgSize = getSvgSize(geoParameters?.bounds, contentWidth, annotations, annotationStartPosition);
    }

    retVal.push({
      annotationLines,
      config,
      geoParameters,
      parentMapViewBox,
      svgSize,
    });

    return retVal;
  }

  function addUpHeightOfMaps(baseMapIndex) {
    let position = 0;
    for (let index = 0; index < baseMapIndex; index++) {
      position += baseMaps[index].svgSize.viewBox[3];
    }
    return position;
  }
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
        {measuringUnit}
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
        <svg
          height={addUpHeightOfMaps(baseMaps.length)}
          width={contentWidth}
          viewBox="0 0 {contentWidth} {addUpHeightOfMaps(baseMaps.length)}"
        >
          {#each baseMaps as baseMap, index}
            <foreignObject
              x=0
              y={index > 0 ? addUpHeightOfMaps(index) : 0}
              width={contentWidth}
              height={baseMap.svgSize.viewBox[3]}
            >
              <GeographicMap
                {annotations}
                {bubbleMapConfig}
                {dataMapping}
                entityType={item.entityType}
                {legendData}
                geoParameters={baseMap.geoParameters}
                svgSize={baseMap.svgSize}
              />
            </foreignObject>
            <g
              style="transform:
                translate(
                  {(contentWidth - baseMap.svgSize.viewBox[2]) / 2}px,
                  {index > 0 ? addUpHeightOfMaps(index) + annotationStartPosition * 1.5 + 1 : annotationStartPosition * 1.5 + 1}px
                );"
            >
              {#each baseMap.annotationLines as annotationLine}
                <g>
                  {#each annotationLine.coordinates as coordinates, index}
                    <Annotation
                      id={annotationLine.id}
                      {index}
                      {annotationRadius}
                      {coordinates}
                      {cssModifier}
                      annotationPosition={annotationLine.position}
                      isLastItem={index === annotationLine.coordinates.length - 1}
                      hasMultipleAnnotations={annotationLine.coordinates.length > 1}
                    />
                  {/each}
                  {#if annotationLine.coordinates.length > 1}
                    <AnnotationConnectionLine
                      {annotationLine}
                      {annotationRadius}
                      {cssModifier}
                    />
                  {/if}
                </g>
              {/each}
            </g>
          {/each}
          <MiniMap
            {annotationRadius}
            {annotationStartPosition}
            {annotations}
            {bubbleMapConfig}
            {contentWidth}
            {cssModifier}
            {dataMapping}
            entityType={item.entityType}
            heightOfPreviousMaps={addUpHeightOfMaps(baseMaps.length)}
            {legendData}
            {miniMaps}
          />
        </svg>
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
    margin: 8px 0px;
    position: relative;
  }
</style>
