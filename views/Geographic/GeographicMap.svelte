<script>
  import Feature from "./Feature.svelte";
  import OutlineFeature from "./OutlineFeature.svelte";
  import ResponsiveSvg from "../svg/ResponsiveSvg.svelte";
  import AnnotationPointWithLine from "../Annotations/AnnotationPointWithLine.svelte";
  import { getColor } from "../helpers/color.js";
  import { getGeoParameters, roundCoordinatesInPath } from "../helpers/geo.js";
  import { round } from "../helpers/data.js";
  import { hasAnnotationOnLeftOrRight, hasAnnotationOnTopOrBottom, regionHasAnnotation, setCoordinatesForGeoMap } from "../helpers/annotations";

  export let dataMapping;
  export let entityType;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let baseMap;
  export let formattingOptions;
  export let annotations = [];
  
  let cssModifier = getCssModifier(contentWidth);

  const maxHeight = 550;
  const geoParameters = getGeoParameters(baseMap, contentWidth, maxHeight);
  const bounds = geoParameters.bounds;

  // Constants for annotations
  const annotationRadius = 9;
  const annotationStartPosition = 16;
  const lineStartPosition = annotationStartPosition - annotationRadius;
  
  const svgSize = getSvgSize(bounds, annotations, annotationRadius, annotationStartPosition); 

  annotations = setCoordinatesForGeoMap(annotations, geoParameters, entityType, annotationStartPosition, lineStartPosition, cssModifier);

  function getCssModifier(contentWidth) {
    if (contentWidth < 400) {
      return "narrow";
    } else if (contentWidth < 470) {
      return "wide";
    } else if (contentWidth < 650) {
      return "wide-plus";
    } else {
      return "extra-wide";
    }
  }
  
  function getSvgSize(bounds, annotations, annotationRadius, annotationStartPosition) {
    let xMin = bounds[0][0];
    let yMin = bounds[0][1];
    let width = bounds[1][0];
    let height = round(bounds[1][1]);
    let padding = 1;

    if (annotations.length > 0) {
      if (hasAnnotationOnTopOrBottom(annotations)) {
        yMin += -(annotationRadius + annotationStartPosition + padding);
        height += (annotationRadius * 2) + (annotationStartPosition * 2) + (padding * 2);
      }
      if (cssModifier !== "narrow" && hasAnnotationOnLeftOrRight(annotations)) {
        xMin += -(annotationRadius + annotationStartPosition + padding);
        width += (annotationRadius * 2) + (annotationStartPosition * 2) + (padding * 2);
      }
    }

    const viewBox = [xMin, yMin, width, height]
      .map(value => round(value))
      .join(" ");
    const aspectRatio = contentWidth / height;

    return { aspectRatio, viewBox };
  }
</script>

<ResponsiveSvg aspectRatio={svgSize.aspectRatio}>
  <svg viewbox={svgSize.viewBox}>
    <g class="q-choropleth-features">
      {#each geoParameters.features.features as feature}
        <Feature
          color={getColor(dataMapping.get(feature.properties[entityType]), legendData)}
          path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
          hasAnnotation={regionHasAnnotation(annotations, feature.properties[entityType])} />
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
    {#each annotations as { id, coordinates }}
      <AnnotationPointWithLine
        id = {id}
        radius = {annotationRadius}
        coordinates = {coordinates}
        fontSize = {"90%"}
        strokeWidth = {1}
        strokeDashArray = {2.5} />
    {/each}
  </svg>
</ResponsiveSvg>
