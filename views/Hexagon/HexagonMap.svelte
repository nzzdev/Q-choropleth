<script>
  import Hexagon from "./Hexagon.svelte";
  import ResponsiveSvg from "../svg/ResponsiveSvg.svelte";
  import AnnotationPointWithLine from "../Annotations/AnnotationPointWithLine.svelte";
  import { getFormattedValue, round } from "../helpers/data.js";
  import { heightFromWidth } from "../helpers/hexagon.js";
  import { getExtents } from "../helpers/extent.js";
  import { getColor } from "../helpers/color.js";
  import { hasAnnotationOnLeftOrRight, hasAnnotationOnTopOrBottom, regionHasAnnotation, setCoordinatesForHexMap } from "../helpers/annotations";
  export let dataMapping;
  export let entityType;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let baseMap;
  export let formattingOptions;
  export let annotations = [];

  let cssModifier = getCssModifier(contentWidth);

  // Sizes of hexagons in SVG units. The values are arbitrary,
  // because the SVG is scaled anyway by its viewBox.
  const cellWidth = 10;
  const cellHeight = heightFromWidth(cellWidth);

  // See https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  const rowHeight = (cellHeight * 3) / 4;

  const hexagons = getHexagons(contentWidth);

  // Constants for annotations
  const annotationRadius = 2.25;
  const annotationStartPosition = 4;
  const lineStartPosition = annotationStartPosition - annotationRadius;

  const svgSize = getSvgSize(hexagons, annotations, annotationRadius, annotationStartPosition);

  annotations = setCoordinatesForHexMap(annotations, hexagons, annotationStartPosition, lineStartPosition, cssModifier);

  function getDisplayValue(value) {
    if (legendData.type === "numerical") {
      return getFormattedValue(formattingOptions, value);
    }
    return value;
  }

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

  function getFontSize(cssModifier, valuesOnMap) {
    if (!valuesOnMap && cssModifier === "wide") {
      return "23%";
    }
    if (cssModifier === "narrow") {
      return "20%";
    }
    if (cssModifier === "wide") {
      return "18%";
    }
    if (cssModifier === "wide-plus") {
      return "13%";
    }
    // cssModifier = "extra-wide";
    return "12%";
  }

  function getHexagons(contentWidth) {
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
            fontSize: getFontSize(cssModifier, valuesOnMap),
            color: getColor(value, legendData),
            width: cellWidth,
            height: cellHeight,
            type: displayValue ? "fill" : "stroke",
            x,
            y: rowIndex * rowHeight,
            hasAnnotation: regionHasAnnotation(annotations, displayEntity)
          });
        }
      });
    });
    return hexagons;
  }

  function getSvgSize(hexagons, annotations, annotationRadius, annotationStartPosition) {
    let [xMin, xMax] = getExtents(hexagons, ({ x }) => x);
    let [yMin, yMax] = getExtents(hexagons, ({ y }) => y);
    let width = xMax - xMin + cellWidth;
    let height = yMax - yMin + cellHeight;

    if (annotations.length > 0) {
      if (hasAnnotationOnTopOrBottom(annotations)) {
        yMin += -(annotationRadius + annotationStartPosition);
        height += (annotationRadius * 2) + (annotationStartPosition * 2);
      }
      if (cssModifier !== "narrow" && hasAnnotationOnLeftOrRight(annotations)) {
        xMin += -(annotationRadius + annotationStartPosition);
        width += (annotationRadius * 2) + (annotationStartPosition * 2);
      }
    }

    let padding = (width / 200);
    width += 2 * padding;
    height += 2 * padding;
    const viewBox = [xMin - padding, yMin - padding, width, height]
      .map(value => round(value))
      .join(" ");

    const aspectRatio = width / height;
    return { aspectRatio, viewBox };
  }
</script>

<ResponsiveSvg aspectRatio={svgSize.aspectRatio}>
  <svg viewbox={svgSize.viewBox}>
    {#each hexagons as { text, fontSize, color, width, height, type, x, y, hasAnnotation }}
      <Hexagon
        {valuesOnMap}
        {text}
        {fontSize}
        {color}
        {width}
        {height}
        {type}
        {x}
        {y}
        {cssModifier}
        growFactor={type === 'fill' ? 0.98 : 0.97}
        {hasAnnotation} />
      <!-- grow factor = 1 would mean, that hexagons are sticked together
        since we want small white spaces between hexagons grow factor is 0.98 by default
        if a hexagon has no value, it will be white with a gray border around it
        since these hexagons should be as big as the other hexagons even with border
        the grow factor is reduced to 0.97 -->
    {/each}
    <g class="q-choropleth-annotations">
      {#each annotations as { id, coordinates }}
        <AnnotationPointWithLine
          id = {id}
          radius = {annotationRadius}
          coordinates = {coordinates}
          fontSize = {"20%"}
          strokeWidth = {0.2}
          strokeDashArray = {0.75} />
      {/each}
    </g>
  </svg>
</ResponsiveSvg>
