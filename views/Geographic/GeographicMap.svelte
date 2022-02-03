<script>
  // import { scaleSqrt as d3ScaleSqrt } from "d3-scale";
  // import { extent as d3Extent } from "d3-array";
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

  export let dataMapping;
  export let entityType;
  export let legendData;
  export let contentWidth;
  export let baseMap;
  export let maxHeight = 550;
  export let annotations = [];
  export let annotationRadius = 8;

  const annotationStartPosition = annotationRadius * 2;
  const annotationSpace = 2 * (annotationRadius + annotationStartPosition + 1); // times two, because annotations can be on both sides (top/bottom or left/right)
  // const data = [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000];
  // const radiusFor = d3ScaleSqrt()
  //   .domain(d3Extent(data, (d) => d))
  //   .range([1.5, 7.5])

  let bounds, geoParameters, svgSize, strokeWidth, cssModifier, annotationLines;
  $: {
    cssModifier = getCssModifier(contentWidth);
    strokeWidth = cssModifier === "narrow" ? 0.15 : 0.3;
    geoParameters = getGeoParameters(baseMap, contentWidth, maxHeight);
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
  $: console.log("-- geoParameters", geoParameters);

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

  // function getRandomNumber(min, max) {
  //   return Math.floor(Math.random() * (max - min + 1)) + min;
  // }
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
            value={dataMapping.get(feature.properties[entityType])}
            path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
            {strokeWidth}
          />
        {/each}
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
                value={dataMapping.get(feature.properties[entityType])}
                path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
                hasAnnotation={true}
                {strokeWidth}
              />
            {/each}
          </g>
        </g>
      {/if}
      <!-- {#each geoParameters.features.features as feature}
        <circle
          fill="#69b3a2"
          opacity=0.95
          stroke="#000"
          cx={geoParameters.path.centroid(feature)[0]}
          cy={geoParameters.path.centroid(feature)[1]}
          r={radiusFor(getRandomNumber(1000000, 10000000))}
        />
      {/each} -->
    {/if}
  </svg>
</ResponsiveSvg>
