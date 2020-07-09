<script>
  import { getFormatedValue } from "./helpers/data.js";
  export let legendData;
  export let contentWidth;
  export let hasFloatingNumbers;
  let labelLegend = getLabelLegend(legendData);

  const legendBarHeight = 16;
  const singleValueBucketWidth = 8;
  const alignmentConfig = {
    small: {
      median: 57,
      average: 43
    },
    medium: {
      median: 81,
      average: 76
    },
    large: {
      median: 89,
      average: 86
    }
  };

  function hasSingleValueBucket(legendData) {
    const firstBucket = legendData.buckets[0];
    return firstBucket.from === firstBucket.to;
  }

  function getAspectWidth(legendData, bucket) {
    const range = legendData.maxValue - legendData.minValue;
    return ((bucket.to - bucket.from) * 100) / range;
  }

  function getAspectXValue(legendData, bucket) {
    const range = legendData.maxValue - legendData.minValue;
    return ((bucket.from - legendData.minValue) * 100) / range;
  }

  function getLabelLegend(legendData) {
    const range = legendData.maxValue - legendData.minValue;
    if (legendData.labelLegend === "median") {
      return {
        id: "median",
        label: "Median",
        value: legendData.medianValue,
        position: (legendData.medianValue * 100) / range
      };
    } else if (legendData.labelLegend === "noLabel") {
      return { label: "noLabel" };
    }
    return {
      id: "average",
      label: "Durchschnitt",
      value: legendData.averageValue,
      position: (legendData.averageValue * 100) / range
    };
  }

  function getDescriptionAlignment(labelLegend) {
    let currentConfig;

    if (contentWidth <= 272) {
      currentConfig = alignmentConfig.small;
    } else if (contentWidth > 272 && contentWidth < 640) {
      currentConfig = alignmentConfig.medium;
    } else if (contentWidth >= 640) {
      currentConfig = alignmentConfig.large;
    }

    if (labelLegend.position > currentConfig[labelLegend.id]) {
      return "text-align: right;";
    }

    return `margin-left: ${labelLegend.position}%`;
  }

  function getColorClass(legendItem) {
    if (legendItem.color.colorClass !== undefined) {
      return legendItem.color.colorClass;
    }
    return "";
  }

  function getCustomColor(legendItem) {
    if (legendItem.color.customColor !== undefined) {
      return legendItem.color.customColor;
    }
    return "";
  }
</script>

{#if legendData !== undefined}
  {#if legendData.type === 'categorical'}
    <!-- display categorical legend -->
    <div class="s-legend-icon-label">
      {#each legendData.categories as category}
        <div
          class="s-legend-item-label__item {getColorClass(category)}"
          style="color: {getCustomColor(category)}">
          <div
            class="s-legend-item-label__item__icon
            s-legend-item-label__item__icon--default" />
          <div class="s-legend-item-label__item__label">{category.label}</div>
        </div>
      {/each}
    </div>
  {:else if legendData.type === 'numerical'}
    <!-- display bucket legend -->
    <div class="q-choropleth-legend--numerical">
      <div class="q-choropleth-legend-container">
        <div class="q-choropleth-legend-value-container">
          <span
            class="q-choropleth-legend-value-container--minVal s-font-note-s">
            {getFormatedValue(legendData.minValue, hasFloatingNumbers)}
          </span>
          <span
            class="q-choropleth-legend-value-container--maxVal s-font-note-s">
            {getFormatedValue(legendData.maxValue, hasFloatingNumbers)}
          </span>
        </div>
        <div class="q-choropleth-legend-border-container">
          <svg class="q-choropleth-legend">
            <g>
              {#each legendData.buckets as bucket, index}
                {#if !(legendData.hasSingleValueBucket && index === 0)}
                  <rect
                    class="q-choropleth-legend-bucket {getColorClass(bucket)}"
                    style="fill: {getCustomColor(bucket)}"
                    width="{getAspectWidth(legendData, bucket)}%"
                    height={legendBarHeight}
                    x="{getAspectXValue(legendData, bucket)}%"
                    y={legendBarHeight - 4} />
                {/if}
              {/each}
            </g>
            {#if labelLegend.label !== 'noLabel'}
              <g>
                <circle
                  cx="{labelLegend.position}%"
                  cy="20"
                  r="4"
                  stroke="white"
                  stroke-width="1"
                  fill="none" />
                <rect
                  class="s-color-gray-9"
                  fill="currentColor"
                  width="0.5px"
                  height={legendBarHeight * 1.8}
                  x="{labelLegend.position}%"
                  y="20" />
              </g>
            {/if}
          </svg>
          <div class="q-choropleth-legend-borders s-color-gray-6" />
        </div>
        {#if labelLegend.label !== 'noLabel'}
          <div
            class="s-font-note-s"
            style={getDescriptionAlignment(labelLegend)}>
            {labelLegend.label}: {labelLegend.value}
          </div>
        {/if}
        {#if hasSingleValueBucket(legendData) || legendData.hasNullValues}
          <div class="q-choropleth-legend-info-container">
            {#if hasSingleValueBucket(legendData)}
              <div
                class="q-choropleth-legend-info--single-bucket s-font-note-s">
                <svg
                  width="11"
                  height="11"
                  class="q-choropleth-legend-info-icon">
                  <rect
                    width="11"
                    height="11"
                    class="q-choropleth-legend-bucket {getColorClass(legendData.buckets[0])}"
                    style="fill: {getCustomColor(legendData.buckets[0])}" />
                </svg>
                {getFormatedValue(legendData.buckets[0].from, hasFloatingNumbers)}
              </div>
            {/if}
            {#if legendData.hasNullValues}
              <div class="q-choropleth-legend-info--no-data s-font-note-s">
                <svg
                  width="11"
                  height="11"
                  class="q-choropleth-legend-info-icon">
                  <rect
                    width="11"
                    height="11"
                    class="s-color-gray-2"
                    fill="white"
                    stroke="currentColor" />
                </svg>
                Keine Daten
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}
