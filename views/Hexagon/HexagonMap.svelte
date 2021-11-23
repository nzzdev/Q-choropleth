<script>
  import Hexagon from "./Hexagon.svelte";
  import ResponsiveSvg from "../svg/ResponsiveSvg.svelte";
  import Annotation from "../Annotations/Annotation.svelte";
  import AnnotationConnectionLine from "../Annotations/AnnotationConnectionLine.svelte";
  import { getColor } from "../helpers/color.js";
  import { getExtents } from "../helpers/extent.js";
  import { getCssModifier } from "../helpers/cssModifier.js";
  import { getFormattedValue } from "../helpers/data.js";
  import { getAspectRatioViewBox } from "../helpers/svg.js";
  import { heightFromWidth, widthFromHeight } from "../helpers/hexagon.js";
  import {
    hasAnnotationOnLeftOrRight,
    regionHasAnnotation,
    setCoordinatesForHexMap,
  } from "../helpers/annotations";

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

  const annotationStartPosition = annotationRadius * 2;
  const annotationSpace = 2 * (annotationRadius + annotationStartPosition + 1); // times two, because annotations can be on both sides (top/bottom or left/right)

  let cssModifier,
    cellWidthAndHeight,
    cellWidth,
    cellHeight,
    rowHeight,
    hexagons,
    svgSize;
  $: {
    cssModifier = getCssModifier(contentWidth);
    // Calculate width and height of a hexagon using contentWidth and maxHeight
    cellWidthAndHeight = getCellWidthAndHeight(
      baseMap.entities,
      contentWidth,
      maxHeight,
      cssModifier,
      annotations,
      annotationSpace
    );
    cellWidth = cellWidthAndHeight.cellWidth;
    cellHeight = cellWidthAndHeight.cellHeight;
    // See https://www.redblobgames.com/grids/hexagons/#size-and-spacing
    rowHeight = (cellHeight * 3) / 4;
    hexagons = getHexagons(cellWidth, cellHeight, rowHeight, annotations);
    svgSize = getSvgSize(
      hexagons,
      contentWidth,
      annotations,
      annotationSpace,
      cellWidth,
      cellHeight
    );
    annotations = setCoordinatesForHexMap(
      annotations,
      hexagons,
      annotationStartPosition,
      cssModifier
    );
  }

  function getSvgSize(
    hexagons,
    contentWidth,
    annotations,
    annotationSpace,
    cellWidth,
    cellHeight
  ) {
    let [xMin, xMax] = getExtents(hexagons, ({ x }) => x);
    let [yMin, yMax] = getExtents(hexagons, ({ y }) => y);
    let width = xMax - xMin + cellWidth;
    let height = yMax - yMin + cellHeight;
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

  function getCellWidthAndHeight(
    baseMapEntities,
    contentWidth,
    maxHeight,
    cssModifier,
    annotations,
    annotationSpace
  ) {
    let cellWidth = 0;
    let cellHeight = 0;
    let countHexagons = getCountHexagons(baseMapEntities);
    let countHexagonsHorizontal = countHexagons.horizontal;
    let countHexagonsVertical = countHexagons.vertical;

    if (hasAnnotationOnLeftOrRight(annotations, cssModifier)) {
      cellWidth = (contentWidth - annotationSpace) / countHexagonsHorizontal;
    } else {
      cellWidth = contentWidth / countHexagonsHorizontal;
    }

    cellHeight = heightFromWidth(cellWidth);

    if (cellHeight > maxHeight / countHexagonsVertical) {
      cellWidth = widthFromHeight(maxHeight / countHexagonsVertical);
      cellHeight = maxHeight / countHexagonsVertical;
    }

    return { cellWidth, cellHeight };
  }

  function getCountHexagons(baseMapEntities) {
    if (!baseMapEntities || baseMapEntities.length < 1)
      return { horizontal: 0, vertical: 0 };

    let lengthOfFirstArray =
      baseMapEntities[0].length < 1 ? 1 : baseMapEntities[0].length;
    let horizontal = Array(baseMapEntities.length).fill(0);
    let vertical = Array(lengthOfFirstArray).fill(0);

    baseMapEntities.forEach((hexagons, rowIndex) => {
      hexagons.forEach((hexagon, columnIndex) => {
        if (hexagon != null) {
          horizontal[rowIndex] += 1;
          vertical[columnIndex] += rowIndex % 2 === 1 ? 0.5 : 1;
        }
      });
      horizontal[rowIndex] += rowIndex % 2 === 1 ? 0.5 : 0;
    });

    return {
      horizontal: Math.max(...horizontal),
      vertical: Math.max(...vertical),
    };
  }

  function getDisplayValue(value) {
    if (legendData.type === "numerical") {
      return getFormattedValue(formattingOptions, value);
    }
    return value;
  }

  function getHexagons(cellWidth, cellHeight, rowHeight, annotations) {
    const hexagons = [];
    baseMap.entities.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell !== null) {
          let x = columnIndex * cellWidth;
          if (rowIndex % 2 === 1) {
            // every odd row will be shifted half the hexagon size to right
            x += cellWidth / 2;
          }
          const value = dataMapping.get(cell[entityType]);
          const displayValue = getDisplayValue(value);
          const displayEntity = cell[baseMap.config.displayEntityType];

          hexagons.push({
            text: [displayEntity, displayValue],
            color: getColor(value, legendData),
            width: cellWidth,
            height: cellHeight,
            type: displayValue ? "fill" : "stroke",
            x,
            y: rowIndex * rowHeight,
            hasAnnotation: regionHasAnnotation(annotations, displayEntity),
          });
        }
      });
    });
    return hexagons;
  }
</script>

<ResponsiveSvg aspectRatio={svgSize.aspectRatio}>
  <svg viewbox={svgSize.viewBox}>
    <g>
      {#each hexagons as { text, color, width, height, type, x, y, hasAnnotation }}
        <Hexagon
          {valuesOnMap}
          {text}
          {color}
          {width}
          {height}
          {type}
          {x}
          {y}
          {cssModifier}
          {hasAnnotation}
        />
      {/each}
    </g>
    {#if annotations && annotations.length > 0}
      <g class="annotations">
        {#each annotations as annotation}
          {#each annotation.regions as region, index}
            <Annotation
              id={annotation.id}
              {index}
              {annotationRadius}
              coordinates={region.coordinates}
              annotationPosition={annotation.position}
              {cssModifier}
              hasMultipleAnnotations={annotation.regions.length > 1}
              isLastItem={index === annotation.regions.length - 1}
            />
          {/each}
          {#if annotation.regions.length > 1}
            <AnnotationConnectionLine
              regions={annotation.regions}
              annotationPosition={annotation.position}
              {annotationRadius}
              {cssModifier}
            />
          {/if}
        {/each}
      </g>
    {/if}
  </svg>
</ResponsiveSvg>
