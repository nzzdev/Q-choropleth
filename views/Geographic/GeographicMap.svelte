<script>
  import Feature from "./Feature.svelte";
  import OutlineFeature from "./OutlineFeature.svelte";
  import ResponsiveSvg from "../svg/ResponsiveSvg.svelte";
  import AnnotationPointWithLine from "../Annotations/AnnotationPointWithLine.svelte";
  import { round } from "../helpers/data.js";
  import { getColor } from "../helpers/color.js";
  import { getCssModifier } from "../helpers/cssModifier.js";
  import { getAspectRatioViewBox } from "../helpers/svg.js";
  import { getGeoParameters, roundCoordinatesInPath } from "../helpers/geo.js";
  import { regionHasAnnotation, setCoordinatesForGeoMap } from "../helpers/annotations";

  export let dataMapping;
  export let entityType;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let baseMap;
  export let formattingOptions;
  export let maxHeight = 550;
  export let annotations = [];
  export let annotationRadius = 8;
  
  let cssModifier = getCssModifier(contentWidth);

  // Constants for annotations
  const annotationStartPosition = annotationRadius * 2;
  const annotationSpace = 2 * (annotationRadius + annotationStartPosition + 1); // times two, because annotations can be on both sides (top/bottom or left/right)
  
  const geoParameters = getGeoParameters(baseMap, contentWidth, maxHeight);
  const bounds = geoParameters.bounds;

  const svgSize = getSvgSize(bounds, contentWidth, annotations, annotationSpace);

  annotations = setCoordinatesForGeoMap(annotations, geoParameters, entityType, annotationStartPosition, cssModifier);

  function getSvgSize(bounds, contentWidth, annotations, annotationSpace) {
    let xMin = bounds[0][0];
    let yMin = bounds[0][1];
    let width = bounds[1][0];
    let height = round(bounds[1][1]);
    return getAspectRatioViewBox(xMin, yMin, width, height, contentWidth, annotations, annotationSpace);
  }

  function getFeaturesWithoutAnnotation(features, annotations, entityType) {
    return features.filter(f => !regionHasAnnotation(annotations, f.properties[entityType]));
  }

  function getFeaturesWithAnnotation(features, annotations, entityType) {
    return features.filter(f => regionHasAnnotation(annotations, f.properties[entityType]));
  }
</script>

<ResponsiveSvg aspectRatio={svgSize.aspectRatio}>
  <svg viewbox={svgSize.viewBox}>
    <g class="q-choropleth-features">
      {#each getFeaturesWithoutAnnotation(geoParameters.features.features, annotations, entityType) as feature}
        <Feature
          color={getColor(dataMapping.get(feature.properties[entityType]), legendData)}
          path={roundCoordinatesInPath(geoParameters.path(feature), 1)} />
      {/each}
    </g>
    {#if geoParameters.outlines.features !== undefined}
      <g class="q-choropleth-outlines">
        {#each geoParameters.outlines.features as outline}
          <OutlineFeature
            path={roundCoordinatesInPath(geoParameters.path(outline), 1)} />
        {/each}
      </g>
    {/if}
    <g class="q-choropleth-annotations">
      {#each annotations as { id, coordinates }}
        <AnnotationPointWithLine
          id = {id}
          radius = {annotationRadius}
          coordinates = {coordinates} />
      {/each}
      <g class="q-choropleth-features">
        <!--
          We're finally adding the features with annotations here and not before, because then we can make sure
          that those features are "on top" of everything else and the border around them is drawn correctly.
        -->
        {#each getFeaturesWithAnnotation(geoParameters.features.features, annotations, entityType) as feature}
          <Feature
            color={getColor(dataMapping.get(feature.properties[entityType]), legendData)}
            path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
            hasAnnotation={true} />
        {/each}
      </g>
    </g>
  </svg>
</ResponsiveSvg>
