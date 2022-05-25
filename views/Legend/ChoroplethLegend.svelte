<script>
  import LegendBubbles from "./LegendBubbles.svelte";
  import {
    getFormattedValue,
    getFormattedValueForBuckets,
  } from "../helpers/data.js";

  export let bubbleMapConfig;
  export let contentWidth;
  export let cssModifier;
  export let formattingOptions;
  export let isStatic;
  export let legendData;
  export let measuringUnit;

  let labelLegend = getLabelLegend(legendData);

  const legendBarHeight = 16;
  const widthConfig = {
    legend: 55,
    average: 100,
    median: 60,
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
        position:
          ((legendData.medianValue - legendData.minValue) * 100) / range,
      };
    } else if (legendData.labelLegend === "noLabel") {
      return { label: "noLabel" };
    }
    return {
      id: "average",
      label: "Durchschnitt",
      value: legendData.averageValue,
      position: ((legendData.averageValue - legendData.minValue) * 100) / range,
    };
  }

  function getValueLength(value) {
    const maxDigitsAfterComma = formattingOptions.maxDigitsAfterComma
      ? formattingOptions.maxDigitsAfterComma
      : 0;
    return value.toFixed(0).length + maxDigitsAfterComma;
  }

  function getAvailableSpaceForLabel(labelLegend, contentWidth) {
    const legendPixelWidth = (contentWidth * widthConfig.legend) / 100;
    return (legendPixelWidth * (100 - labelLegend.position)) / 100;
  }

  function getDescriptionAlignment(labelLegend, contentWidth) {
    const availableSpaceForLabel = getAvailableSpaceForLabel(
      labelLegend,
      contentWidth
    );
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

  function getIconClass(isStatic) {
    return isStatic ? "static" : "interactive";
  }
</script>

{#if legendData !== undefined}
  {#if legendData.type === "categorical"}
    <!-- display categorical legend -->
    <div class="s-legend-icon-label">
      {#each legendData.categories as category}
        <div
          class="s-legend-item-label__item {getColorClass(category)}"
          style="color: {getCustomColor(category)}"
        >
          <div
            class="s-legend-item-label__item__icon
            s-legend-item-label__item__icon--default"
          />
          <div class="s-legend-item-label__item__label">{category.label}</div>
        </div>
      {/each}
    </div>
    {#if legendData.hasNullValues && !bubbleMapConfig}
      <div class="s-legend-icon-label">
        <div class="s-legend-item-label__item">
          <svg
            width=11
            height=11
            class="s-legend-item-label__item__icon legend-info-icon
            legend-info-icon--{getIconClass(isStatic)}"
          >
            <rect
              width=11
              height=11
              class="s-color-gray-4"
              fill="white"
              stroke="currentColor"
              stroke-width=2
            />
          </svg>
          <div class="s-legend-item-label__item__label">Keine Daten</div>
        </div>
      </div>
    {/if}
  {:else if legendData.type === "numerical"}
    <!-- display bucket legend -->
    <div class="legend--numerical">
      <div class="legend-container" style="width: {widthConfig.legend}%">
        <div class="legend-value-container">
          <span
            class="legend-value__minVal s-font-note s-font-note--tabularnums"
            class:legend-value__minVal--measuringUnit={measuringUnit ? true : false}
          >
            {getFormattedValueForBuckets(
              formattingOptions,
              legendData.minValue
            )}
            {measuringUnit || ""}
          </span>
          <span
            class="legend-value__maxVal s-font-note s-font-note--tabularnums"
          >
            {getFormattedValueForBuckets(
              formattingOptions,
              legendData.maxValue
            )}
          </span>
        </div>
        <div class="legend-border-container">
          <svg class="legend">
            <g>
              {#each legendData.buckets as bucket, index}
                {#if !(legendData.hasSingleValueBucket && index === 0)}
                  <rect
                    class="legend-bucket {getColorClass(bucket)}"
                    style="fill: {getCustomColor(bucket)}"
                    width="{getAspectWidth(legendData, bucket)}%"
                    height={legendBarHeight}
                    x="{getAspectXValue(legendData, bucket)}%"
                    y={legendBarHeight - 4}
                  />
                {/if}
              {/each}
            </g>
            {#if labelLegend.label !== "noLabel"}
              <g>
                <circle
                  cx="{labelLegend.position}%"
                  cy="20"
                  r="4"
                  stroke="white"
                  stroke-width="1"
                  fill="none"
                />
                <rect
                  class="s-color-gray-9"
                  fill="currentColor"
                  width="0.5px"
                  height={legendBarHeight * 1.8}
                  x="{labelLegend.position}%"
                  y="20"
                />
              </g>
            {/if}
          </svg>
          <div class="legend-borders s-color-gray-6" />
        </div>
        {#if labelLegend.label !== "noLabel"}
          <div
            class="legend-marker s-font-note s-font-note--tabularnums"
            style={getDescriptionAlignment(labelLegend, contentWidth)}
          >
            {labelLegend.label}: {getFormattedValue(
              formattingOptions,
              labelLegend.value
            )}
          </div>
        {/if}
        {#if hasSingleValueBucket(legendData) || legendData.hasNullValues}
          <div class="s-legend-icon-label">
            {#if hasSingleValueBucket(legendData)}
              <div
                class="s-legend-item-label__item
                legend-info--single-bucket"
              >
                <svg
                  width="11"
                  height="11"
                  class="s-legend-item-label__item__icon
                  legend-info-icon 
                  legend-info-icon--{getIconClass(isStatic)}"
                >
                  <rect
                    width="11"
                    height="11"
                    class="legend-bucket {getColorClass(legendData.buckets[0])}"
                    style="fill: {getCustomColor(legendData.buckets[0])}"
                  />
                </svg>
                <div
                  class="s-legend-item-label__item__label s-font-note--tabularnums"
                >
                  = {getFormattedValueForBuckets(
                    formattingOptions,
                    legendData.buckets[0].from
                  )}
                </div>
              </div>
            {/if}
            {#if legendData.hasNullValues && !bubbleMapConfig}
              <div
                class="s-legend-item-label__item
                legend-info--no-data "
              >
                <svg
                  width="11"
                  height="11"
                  class="s-legend-item-label__item__icon
                  legend-info-icon legend-info-icon--{getIconClass(isStatic)}"
                >
                  <rect
                    width=11
                    height=11
                    class="s-color-gray-4"
                    fill="white"
                    stroke="currentColor"
                    stroke-width=2
                  />
                </svg>
                <div class="s-legend-item-label__item__label">Keine Daten</div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
      {#if bubbleMapConfig}
        <LegendBubbles
          {bubbleMapConfig}
          {cssModifier}
        />
      {/if}
    </div>
  {/if}
{/if}

<style>
  .legend-container {
    display: flex;
    flex-direction: column;
  }

  .legend {
    height: 32px;
    width: 100%;
  }

  .legend-bucket {
    fill: currentColor;
  }

  .legend-value-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .legend-value__minVal {
    margin-left: -4px;
  }

  .legend-value__minVal--measuringUnit {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .legend-value__maxVal {
    margin-right: -4px;
  }

  .legend-border-container {
    position: relative;
  }

  .legend-borders {
    position: absolute;
    height: 28px;
    top: 0px;
    border-right: 0.5px solid currentColor;
    border-left: 0.5px solid currentColor;
    width: 100%;
  }

  .legend-info--single-bucket {
    margin-right: 16px;
  }

  .legend-info-icon--interactive {
    margin-top: -2px;
  }

  .legend-info-icon--static {
    margin-top: 1px;
  }

  .legend--numerical {
    align-items: center;
    display: flex;
    flex-direction: column;
  }
</style>
