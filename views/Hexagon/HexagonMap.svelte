<script>
  import Hexagon from "./Hexagon.svelte";
  import ResponsiveSvg from "../svg/ResponsiveSvg.svelte";
  import AnnotationPointWithLine from "../Annotations/AnnotationPointWithLine.svelte";
  import { getFormattedValue, round } from "../helpers/data.js";
  import { heightFromWidth, widthFromHeight } from "../helpers/hexagon.js";
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
  export let maxHeight = 550;
  export let annotations = [];
  export let annotationRadius = 8;

  let cssModifier = getCssModifier(contentWidth);

  // Calculate width and height of a hexagon using contentWidth and maxHeight
  let countHexagons = getCountHexagons(baseMap.entities);
  const countHexagonsHorizontal = countHexagons.horizontal;
  const countHexagonsVertical = countHexagons.vertical;

  let cellWidth = contentWidth / countHexagonsHorizontal;
  let cellHeight = heightFromWidth(cellWidth);

  if (cellHeight > (maxHeight / countHexagonsVertical)) {
    cellWidth = widthFromHeight(maxHeight / countHexagonsVertical);
    cellHeight = (maxHeight / countHexagonsVertical);
  }

  // See https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  const rowHeight = (cellHeight * 3) / 4;

  const hexagons = getHexagons();

  // Constants for annotations
  const annotationStartPosition = annotationRadius * 2;
  const lineStartPosition = annotationStartPosition - annotationRadius;

  const svgSize = getSvgSize(hexagons, annotations, annotationRadius, annotationStartPosition);

  annotations = setCoordinatesForHexMap(annotations, hexagons, annotationStartPosition, lineStartPosition, cssModifier);

  function getCountHexagons(baseMapEntities) {
    if (!baseMapEntities || baseMapEntities.length < 1) return { horizontal: 0, vertical: 0 };
    
    let lengthOfFirstArray = (baseMapEntities[0].length < 1 ? 1 : baseMapEntities[0].length);
    let horizontal = Array(baseMapEntities.length).fill(0);
    let vertical = Array(lengthOfFirstArray).fill(0);
    
    baseMapEntities.forEach( (hexagons, indexHexagons) => {
      hexagons.forEach( (hexagon, indexHexagon) => {
        if(hexagon != null) {
          horizontal[indexHexagons] += 1;
          vertical[indexHexagon] += (indexHexagons % 2 === 1 ? 0.5 : 1);
        }
      });
    });

    return { horizontal: Math.max(...horizontal), vertical: Math.max(...vertical) };
  }

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

  function getHexagons() {
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
    let padding = 1;
  
    if (annotations.length > 0) {
      if (hasAnnotationOnTopOrBottom(annotations, cssModifier)) {
        yMin += -(annotationRadius + annotationStartPosition + padding);
        height += (annotationRadius * 2) + (annotationStartPosition * 2) + (padding * 2);
      }
      if (hasAnnotationOnLeftOrRight(annotations, cssModifier)) {
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
    <g class="q-choropleth-hexagons">
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
          growFactor={type === 'fill' ? 0.98 : 0.97}
          {hasAnnotation} />
        <!-- grow factor = 1 would mean, that hexagons are sticked together
          since we want small white spaces between hexagons grow factor is 0.98 by default
          if a hexagon has no value, it will be white with a gray border around it
          since these hexagons should be as big as the other hexagons even with border
          the grow factor is reduced to 0.97 -->
      {/each}
    </g>
    <g class="q-choropleth-annotations">
      {#each annotations as { id, coordinates }}
        <AnnotationPointWithLine
          id = {id}
          radius = {annotationRadius}
          coordinates = {coordinates} />
      {/each}
    </g>
  </svg>
</ResponsiveSvg>
