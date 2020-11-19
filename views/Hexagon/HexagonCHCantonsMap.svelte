<script>
  import Hexagon from "./Hexagon.svelte";
  import ResponsiveSvg from "./ResponsiveSvg.svelte";
  import { getFormattedValue } from "../helpers/data.js";
  import { heightFromWidth } from "../helpers/hexagon.js";
  import { getExtents } from "../helpers/extent.js";
  import { getColor } from "../helpers/color.js";
  export let data;
  export let entityType;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let entityCollectionInfo;
  export let formattingOptions;

  let cssModifier = getCssModifier(contentWidth);

  // Sizes of hexagons in SVG units. The values are arbitrary,
  // because the SVG is scaled anyway by its viewBox.
  const cellWidth = 10;
  const cellHeight = heightFromWidth(cellWidth);

  // See https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  const rowHeight = (cellHeight * 3) / 4;

  const hexagons = getHexagons(contentWidth);
  const svgSize = getSvgSize(hexagons);

  function getValue(cantonCode) {
    try {
      const dataMapping = new Map(data);
      if (entityType === "code") {
        return dataMapping.get(cantonCode);
      } else {
        const entityMapping = entityCollectionInfo.entityMapping;
        const entity = entityMapping.get(cantonCode);
        return dataMapping.get(entity);
      }
    } catch (e) {
      return null;
    }
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
    const grid = entityCollectionInfo.config.grid;
    const hexagons = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell !== null) {
          let x = columnIndex * cellWidth;
          if (rowIndex % 2 === 1) {
            // every odd row will be shifted half the hexagon size to right
            x += cellWidth / 2;
          }
          const cantonCode = cell;
          const value = getValue(cantonCode);
          const displayValue = getDisplayValue(value);

          hexagons.push({
            text: [cantonCode, displayValue],
            fontSize: getFontSize(cssModifier, valuesOnMap),
            color: getColor(value, legendData),
            width: cellWidth,
            height: cellHeight,
            type: displayValue ? "fill" : "stroke",
            x,
            y: rowIndex * rowHeight
          });
        }
      });
    });
    return hexagons;
  }

  function getSvgSize(hexagons) {
    const [xMin, xMax] = getExtents(hexagons, ({ x }) => x);
    const [yMin, yMax] = getExtents(hexagons, ({ y }) => y);
    let width = xMax - xMin + cellWidth;
    let height = yMax - yMin + cellHeight;
    const padding = width / 200;
    width += 2 * padding;
    height += 2 * padding;
    const viewBox = [xMin - padding, yMin - padding, width, height].join(" ");
    const aspectRatio = width / height;
    return { aspectRatio, viewBox };
  }
</script>

<ResponsiveSvg aspectRatio={svgSize.aspectRatio}>
  <svg viewbox={svgSize.viewBox}>
    {#each hexagons as { text, fontSize, color, width, height, type, x, y }}
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
        growFactor={type === 'fill' ? 0.98 : 0.97} />
      <!-- grow factor = 1 would mean, that hexagons are sticked together
        since we want small white spaces between hexagons grow factor is 0.98 by default
        if a hexagon has no value, it will be white with a gray border around it
        since these hexagons should be as big as the other hexagons even with border
        the grow factor is reduced to 0.97 -->
    {/each}
  </svg>
</ResponsiveSvg>
