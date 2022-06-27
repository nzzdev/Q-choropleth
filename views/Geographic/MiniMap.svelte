<script>
  import GeographicMap from "./GeographicMap.svelte";
  import Annotation from "../Annotations/Annotation.svelte";
  import AnnotationConnectionLine from "../Annotations/AnnotationConnectionLine.svelte";

  export let annotationRadius;
  export let annotationStartPosition;
  export let annotations;
  export let bubbleMapConfig;
  export let cssModifier;
  export let contentWidth;
  export let dataMapping;
  export let entityType;
  export let heightOfPreviousMaps;
  export let legendData;
  export let miniMaps;

  function fixAnnotationLines(annotationLines, config, viewBox, parentMapViewBox) {
    if (!annotationLines || annotationLines.length === 0) return [];

    for (const annotationLine of annotationLines) {
      for (const coordinates of annotationLine.coordinates) {
        fixAnnotationCoordinates(
          coordinates,
          annotationLine.position,
          config,
          parentMapViewBox[3],
          viewBox[2],
          viewBox[3],
          annotationStartPosition
        );
      }
    }

    return annotationLines;
  }

  function fixAnnotationCoordinates(coordinates, position, config, heightParentMap, widthMiniMap, heightMiniMap, annotationStartPosition) {
    if (config.top && config.left) {
      if (cssModifier === "narrow") {
        if (position === "bottom" || position === "right") {
          coordinates.y = heightParentMap - (annotationStartPosition * 2 + 2);
          coordinates.lineY1 = heightParentMap - (annotationStartPosition * 2 + 2);
        }
        // top and left are already fine
      } else {
        if (position === "bottom") {
          coordinates.y = heightParentMap - (annotationStartPosition * 2 + 2);
          coordinates.lineY1 = heightParentMap - (annotationStartPosition * 2 + 2);
        }
        if (position === "right") {
          coordinates.x = contentWidth - (annotationStartPosition * 2 + 2);
          coordinates.lineX2 = contentWidth - (annotationStartPosition * 2 + 2);
        }
      }
    }
    if (!config.top && config.left) {
      if (cssModifier === "narrow") {
        if (position === "top" || position === "left") {
          coordinates.y = -(heightParentMap - heightMiniMap - (annotationStartPosition * 2 + 2));
          coordinates.lineY1 = -(heightParentMap - heightMiniMap - (annotationStartPosition * 2 + 2));
        }
        // bottom and right are already fine
      } else {
        if (position === "top") {
          coordinates.y = -(heightParentMap - heightMiniMap - (annotationStartPosition * 2 + 2));
          coordinates.lineY1 = -(heightParentMap - heightMiniMap - (annotationStartPosition * 2 + 2));
        }
        if (position === "right") {
          coordinates.x = contentWidth - (annotationStartPosition * 2 + 2);
          coordinates.lineX2 = contentWidth - (annotationStartPosition * 2 + 2);
        }
      }
    }
    if (config.top && !config.left) {
      if (cssModifier === "narrow") {
        if (position === "bottom" || position === "right") {
          coordinates.y = heightParentMap - (annotationStartPosition * 2 + 2);
          coordinates.lineY1 = heightParentMap - (annotationStartPosition * 2 + 2);
        }
        // top and left are already fine
      } else {
        if (position === "bottom") {
          coordinates.y = heightParentMap - (annotationStartPosition * 2 + 2);
          coordinates.lineY1 = heightParentMap - (annotationStartPosition * 2 + 2);
        }
        if (position === "left") {
          // TODO
          coordinates.x = -(contentWidth - widthMiniMap - (annotationStartPosition * 2 + 2));
          coordinates.lineX1 = -(contentWidth - widthMiniMap - (annotationStartPosition * 2 + 2));
        }
      }
    }
    if (!config.top && !config.left) {
      if (cssModifier === "narrow") {
        if (position === "top" || position === "left") {
          coordinates.y = -(heightParentMap - heightMiniMap - (annotationStartPosition * 2 + 2));
          coordinates.lineY1 = -(heightParentMap - heightMiniMap - (annotationStartPosition * 2 + 2));
        }
        // bottom and right are already fine
      } else {
        if (position === "top") {
          coordinates.y = -(heightParentMap - heightMiniMap - (annotationStartPosition * 2 + 2));
          coordinates.lineY1 = -(heightParentMap - heightMiniMap - (annotationStartPosition * 2 + 2));
        }
        if (position === "left") {
          // TODO
          coordinates.x = -(contentWidth - widthMiniMap - (annotationStartPosition * 2 + 2));
          coordinates.lineX1 = -(contentWidth - widthMiniMap - (annotationStartPosition * 2 + 2));
        }
      }
    }
  }

  function getPositionX(config, contentWidth, width, hasAnnotation) {
    const annotationSpace = cssModifier === "narrow" || !hasAnnotation ? 0 : (annotationStartPosition * 1.5) + 1;
    if (config.left) {
      return annotationSpace;
    } else {
      return contentWidth - width - annotationSpace;
    }
  }

  function getPositionY(config, contentHeight, height, hasAnnotation) {
    const annotationSpace = hasAnnotation ? (annotationStartPosition * 1.5) + 1 : 0;
    if (config.top) {
      return annotationSpace;
    } else {
      return contentHeight - height - annotationSpace;
    }
  }
</script>

{#each miniMaps as baseMap}
  <foreignObject
    x={getPositionX(baseMap.config, contentWidth, baseMap.svgSize.viewBox[2], baseMap.annotationLines.length > 0)}
    y={getPositionY(baseMap.config, heightOfPreviousMaps, baseMap.svgSize.viewBox[3], baseMap.annotationLines.length > 0)}
    width={baseMap.svgSize.viewBox[2]}
    height={baseMap.config.title ? baseMap.svgSize.viewBox[3] + 16 : baseMap.svgSize.viewBox[3]}
  >
    <GeographicMap
      {annotations}
      {bubbleMapConfig}
      {dataMapping}
      {entityType}
      {legendData}
      geoParameters={baseMap.geoParameters}
      svgSize={baseMap.svgSize}
      title={baseMap.config.title}
    />
  </foreignObject>
  <g
    style="transform:
      translate(
        {getPositionX(baseMap.config, contentWidth, baseMap.svgSize.viewBox[2], baseMap.annotationLines.length > 0)}px,
        {getPositionY(baseMap.config, heightOfPreviousMaps, baseMap.svgSize.viewBox[3], baseMap.annotationLines.length > 0)}px
      );"
  >
    {#each fixAnnotationLines(baseMap.annotationLines, baseMap.config, baseMap.svgSize.viewBox, baseMap.parentMapViewBox) as annotationLine}
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
