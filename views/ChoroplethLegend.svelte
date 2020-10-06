<script>
  import {
    getFormattedValue,
    getFormattedValueForBuckets
  } from "./helpers/data.js";
  export let legendData;
  export let formattingOptions;
  export let contentWidth;
  let labelLegend = getLabelLegend(legendData);

  const legendBarHeight = 16;
  const singleValueBucketWidth = 8;
  const widthConfig = {
    legend: 55,
    average: 100,
    median: 60
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
        position: ((legendData.medianValue - legendData.minValue) * 100) / range
      };
    } else if (legendData.labelLegend === "noLabel") {
      return { label: "noLabel" };
    }
    return {
      id: "average",
      label: "Durchschnitt",
      value: legendData.averageValue,
      position: ((legendData.averageValue - legendData.minValue) * 100) / range
    };
  }

  function getValueLength(value) {
    const maxDigitsAfterComma = formattingOptions.maxDigitsAfterComma
      ? formattingOptions.maxDigitsAfterComma
      : 0;
    return value.toFixed(0).length + maxDigitsAfterComma;
  }

  function getAvailableSpaceForLabel(labelLegend) {
    const legendPixelWidth = (contentWidth * widthConfig.legend) / 100;
    return (legendPixelWidth * (100 - labelLegend.position)) / 100;
  }

  function getDescriptionAlignment(labelLegend) {
    const availableSpaceForLabel = getAvailableSpaceForLabel(labelLegend);
    const valueLength = getValueLength(labelLegend.value);
    const approxLabelWidth = widthConfig[labelLegend.id] + valueLength * 8;

    if (availableSpaceForLabel < approxLabelWidth) {
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
    <div class="q-choropleth-legend-info--no-data s-font-note">
      <div class="q-choropleth-legend-info-icon-container">
        <svg width="11" height="11" class="q-choropleth-legend-info-icon">
          <rect
            width="11"
            height="11"
            class="s-color-gray-4"
            fill="white"
            stroke="currentColor"
            stroke-width="2" />
        </svg>
      </div>
      Keine Daten
    </div>
  {:else if legendData.type === 'numerical'}
    <!-- display bucket legend -->
    <div class="q-choropleth-legend--numerical">
      <div
        class="q-choropleth-legend-container"
        style="width: {widthConfig.legend}%">
        <div class="q-choropleth-legend-value-container">
          <span class="q-choropleth-legend-value-container--minVal s-font-note">
            {getFormattedValueForBuckets(formattingOptions, legendData.minValue)}
          </span>
          <span class="q-choropleth-legend-value-container--maxVal s-font-note">
            {getFormattedValueForBuckets(formattingOptions, legendData.maxValue)}
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
          <div class="s-font-note" style={getDescriptionAlignment(labelLegend)}>
            {labelLegend.label}: {getFormattedValue(formattingOptions, labelLegend.value)}
          </div>
        {/if}
        {#if hasSingleValueBucket(legendData) || legendData.hasNullValues}
          <div class="q-choropleth-legend-info-container">
            {#if hasSingleValueBucket(legendData)}
              <div class="q-choropleth-legend-info--single-bucket s-font-note">
                <div class="q-choropleth-legend-info-icon-container">
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
                </div>
                = {getFormattedValueForBuckets(formattingOptions, legendData.buckets[0].from)}
              </div>
            {/if}
            {#if legendData.hasNullValues}
              <div class="q-choropleth-legend-info--no-data s-font-note">
                <div class="q-choropleth-legend-info-icon-container">
                  <svg
                    width="11"
                    height="11"
                    class="q-choropleth-legend-info-icon">
                    <rect
                      width="11"
                      height="11"
                      class="s-color-gray-4"
                      fill="white"
                      stroke="currentColor"
                      stroke-width="2" />
                  </svg>
                </div>
                Keine Daten
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}
