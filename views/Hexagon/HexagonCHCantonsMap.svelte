<script>
  import Hexagon from "./Hexagon.svelte";
  import { getFormattedValue } from "../helpers/data.js";
  import { heightFromWidth } from "../helpers/hexagon.js";
  import { getExtents } from "../helpers/extent.js";
  export let data;
  export let entityType;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let entityInfo;
  export let formattingOptions;

  const dataMapping = new Map(data);
  const cellWidth = 10;
  const cellHeight = heightFromWidth(cellWidth);
  const rowHeight = (cellHeight * 3) / 4;
  const hexagons = getHexagons();
  const svgSize = getSvgSize(hexagons);
  const baseSpacing = 18;

  function getValue(cantonCode) {
    try {
      if (entityType === "code") {
        return dataMapping.get(cantonCode);
      } else {
        const entityMapping = entityInfo.entityMapping;
        const entity = entityMapping.get(cantonCode);
        return dataMapping.get(entity);
      }
    } catch (e) {
      return null;
    }
  }

  function getColor(cantonCode, legendData) {
    const value = getValue(cantonCode);
    if (value === null || value === undefined) {
      return {
        colorClass: "s-color-gray-4",
        customColor: "",
        textColor: "s-color-gray-6"
      };
    }
    if (legendData.type === "numerical") {
      const buckets = legendData.buckets;
      const bucket = buckets.find((bucket, index) => {
        if (index === 0) {
          return value <= bucket.to;
        } else if (index === buckets.length - 1) {
          return bucket.from < value;
        } else {
          return bucket.from < value && value <= bucket.to;
        }
      });
      if (bucket) {
        return {
          colorClass: bucket.color.colorClass,
          customColor: bucket.color.customColor,
          textColor: bucket.color.textColor
        };
      } else {
        return {
          colorClass: "s-color-gray-4",
          customColor: "",
          textColor: "s-color-gray-6"
        };
      }
    } else {
      const categories = legendData.categories;
      const category = categories.find(category => category.label === value);
      if (category) {
        return {
          colorClass: category.color.colorClass,
          customColor: category.color.customColor,
          textColor: category.color.textColor
        };
      } else {
        return {
          colorClass: "s-color-gray-4",
          customColor: ""
        };
      }
    }
  }

  function getDisplayValue(cantonCode) {
    let value = getValue(cantonCode);
    if (legendData.type === "numerical") {
      return getFormattedValue(formattingOptions, value);
    }
    return value;
  }

  function getFontSize(contentWidth) {
    if (contentWidth < 400) {
      return 1.2;
    } else if (contentWidth > 400 && contentWidth < 470) {
      return 1.1;
    } else {
      return 1;
    }
  }

  function getHexagons() {
    const grid = entityInfo.config.grid;
    const hexagons = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell !== null) {
          let x = columnIndex * cellWidth;
          if (rowIndex % 2 === 1) {
            x += cellWidth / 2;
          }
          const cantonCode = cell;
          const displayValue = getDisplayValue(cantonCode);

          hexagons.push({
            text: [cantonCode, displayValue],
            color: getColor(cantonCode, legendData),
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

<div class="swiss-hexagon-map">
  <!-- ^ just temp div -->
  <!-- TODO: make Responsive SVG like in US elections with aspect ratio -->
  <svg viewbox={svgSize.viewBox}>
    {#each hexagons as { text, color, width, height, type, x, y }}
      <Hexagon
        {valuesOnMap}
        {text}
        {color}
        {width}
        {height}
        {type}
        {x}
        {y}
        growFactor={type === 'fill' ? 0.98 : 0.97} />
    {/each}
  </svg>
</div>
