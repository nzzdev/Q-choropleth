<script>
  import Bubble from "./Bubble.svelte";
  import Feature from "./Feature.svelte";
  import OutlineFeature from "./OutlineFeature.svelte";
  import WaterFeature from "./WaterFeature.svelte";
  import ResponsiveSvg from "../svg/ResponsiveSvg.svelte";
  import Annotation from "../Annotations/Annotation.svelte";
  import AnnotationConnectionLine from "../Annotations/AnnotationConnectionLine.svelte";
  import { round } from "../helpers/data.js";
  import { getColor } from "../helpers/color.js";
  import { getCssModifier } from "../helpers/cssModifier.js";
  import { getAspectRatioViewBox } from "../helpers/svg.js";
  import { getGeoParameters, roundCoordinatesInPath } from "../helpers/geo.js";
  import {
    regionHasAnnotation,
    getAnnotationsForGeoMap,
  } from "../helpers/annotations";

  export let annotations = [];
  export let annotationRadius = 8;
  export let baseMap;
  export let bubbleMapConfig;
  export let contentWidth;
  export let dataMapping;
  export let entityType;
  export let legendData;
  export let maxHeight = 550;

  const annotationStartPosition = annotationRadius * 2;
  const annotationSpace = 2 * (annotationRadius + annotationStartPosition + 1); // times two, because annotations can be on both sides (top/bottom or left/right)

  let bounds, geoParameters, svgSize, strokeWidth, cssModifier, annotationLines;
  $: {
    cssModifier = getCssModifier(contentWidth);
    strokeWidth = cssModifier === "narrow" ? 0.15 : 0.3;
    geoParameters = getGeoParameters(baseMap, contentWidth, maxHeight);
    if (bubbleMapConfig) {
      bubbleMapConfig.scaleRange = [1.5, cssModifier === "narrow" ? 19 : 25]
      // sort descending, so that the biggest bubbles are at the bottom
      geoParameters?.features.features.sort(function(a, b) {
        let populationA = Number(a.properties.population);
        let populationB = Number(b.properties.population);
        if (populationA < populationB) return 1;
        if (populationA > populationB) return -1;
        return 0;
      });
    }
    bounds = geoParameters ? geoParameters.bounds : undefined;
    svgSize = getSvgSize(bounds, contentWidth, annotations, annotationSpace);
    annotationLines = getAnnotationsForGeoMap(
      annotations,
      geoParameters,
      entityType,
      annotationStartPosition,
      cssModifier
    );
  }

  function getSvgSize(bounds, contentWidth, annotations, annotationSpace) {
    if (!bounds) return { aspectRatio: 1, viewBox: [0, 0, contentWidth, maxHeight] };
    let xMin = bounds[0][0];
    let yMin = bounds[0][1];
    let width = bounds[1][0];
    let height = round(bounds[1][1]);
    return getAspectRatioViewBox(
      xMin,
      yMin,
      width,
      height,
      contentWidth,
      annotations,
      annotationSpace
    );
  }

  function getFeaturesWithoutAnnotation(features, annotations, entityType) {
    return features.filter((f) => {
      return !regionHasAnnotation(annotations, f.properties[entityType]);
    });
  }

  function getFeaturesWithAnnotation(features, annotations, entityType) {
    return features.filter((f) => {
      return regionHasAnnotation(annotations, f.properties[entityType]);
    });
  }
</script>

<ResponsiveSvg aspectRatio={svgSize.aspectRatio}>
  <svg viewbox={svgSize.viewBox}>
    {#if geoParameters}
      <g>
        {#each getFeaturesWithoutAnnotation(geoParameters.features.features, annotations, entityType) as feature}
          <Feature
            color={getColor(
              dataMapping.get(feature.properties[entityType]),
              legendData
            )}
            value={bubbleMapConfig ? undefined : dataMapping.get(feature.properties[entityType])}
            path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
            showBubbleMap={bubbleMapConfig ? true : false}
            {strokeWidth}
          />
        {/each}
        {#if bubbleMapConfig}
          {#each getFeaturesWithoutAnnotation(geoParameters.features.features, annotations, entityType) as feature}
            <Bubble
              centroid={feature.properties?.centroid}
              color={getColor(
                dataMapping.get(feature.properties[entityType]),
                legendData
              )}
              config={bubbleMapConfig}
              population={feature.properties?.population}
              {strokeWidth}
              value={dataMapping.get(feature.properties[entityType])}
            />
          {/each}
        {/if}
      </g>
      {#if geoParameters.outlines.features !== undefined}
        <g>
          {#each geoParameters.outlines.features as outline}
            <OutlineFeature
              path={roundCoordinatesInPath(geoParameters.path(outline), 1)}
              {strokeWidth}
            />
          {/each}
        </g>
      {/if}
      {#if geoParameters.water.features !== undefined}
        <g>
          {#each geoParameters.water.features as water}
            <WaterFeature
              path={roundCoordinatesInPath(geoParameters.path(water), 1)}
            />
          {/each}
        </g>
      {/if}
      {#if annotations && annotations.length > 0}
        <g class="annotations">
          <g>
            <!--
              Features with annotations are added here, so the border around them is drawn correctly.
            -->
            {#each getFeaturesWithAnnotation(geoParameters.features.features, annotations, entityType) as feature}
              <Feature
                color={getColor(
                  dataMapping.get(feature.properties[entityType]),
                  legendData
                )}
                hasAnnotation={true}
                value={dataMapping.get(feature.properties[entityType])}
                path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
                showBubbleMap={bubbleMapConfig ? true : false}
                {strokeWidth}
              />
            {/each}
          </g>
          {#each annotationLines as annotationLine}
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
          {/each}
        </g>
      {/if}
      {#if bubbleMapConfig}
        {#each getFeaturesWithAnnotation(geoParameters.features.features, annotations, entityType) as feature}
          <Bubble
            centroid={feature.properties?.centroid}
            color={getColor(
              dataMapping.get(feature.properties[entityType]),
              legendData
            )}
            config={bubbleMapConfig}
            hasAnnotation={true}
            population={feature.properties?.population}
            {strokeWidth}
            value={dataMapping.get(feature.properties[entityType])}
          />
        {/each}
      {/if}
    {/if}
  </svg>
</ResponsiveSvg>
