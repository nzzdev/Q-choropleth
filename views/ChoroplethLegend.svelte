<script>
  export let legendData;
  let labelLegend = getLabelLegend(legendData);

  const legendBarHeight = 16;
  const singleValueBucketWidth = 8;

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
    if (legendData.labelLegend === "median") {
      return {
        label: "Median",
        value: legendData.medianValue,
        position: (legendData.medianValue * 100) / legendData.maxValue
      };
    } else if (legendData.labelLegend === "noLabel") {
      return { label: "noLabel" };
    }
    return {
      label: "Durchschnitt",
      value: legendData.averageValue,
      position: 50
    };
  }
</script>

{#if legendData !== undefined}
  {#if legendData.type === 'categorical'}
    <!-- display categorical legend -->
    <div class="s-legend-icon-label">
      {#each legendData.categories as category}
        <div
          class="s-legend-item-label__item {category.color.colorClass !== undefined ? category.color.colorClass : ''}"
          style="color: {category.color.customColor !== undefined ? category.color.customColor : ''}">
          <div
            class="s-legend-item-label__item__icon
            s-legend-item-label__item__icon--default" />
          <div class="s-legend-item-label__item__label">{category.label}</div>
        </div>
      {/each}
    </div>
  {:else if legendData.type === 'numerical'}
    <!-- display bucket legend -->
    <div style="display: flex; justify-content: center;">
      <div class="q-choropleth-legend-container">
        <div class="q-choropleth-legend-value-container">
          <span style="margin-left: 2px" class="s-font-note-s">
            {legendData.minValue}
          </span>
          <span style="margin-right: 2px" class="s-font-note-s">
            {legendData.maxValue}
          </span>
        </div>
        <div class="q-choropleth-legend-border-container">
          <svg class="q-choropleth-legend">
            <g>
              {#each legendData.buckets as bucket, index}
                {#if !(hasSingleValueBucket(legendData) && index === 0)}
                  <rect
                    class="q-choropleth-legend-bucket {bucket.color.colorClass}"
                    style="fill: {bucket.color.customColor}"
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
                  style="fill: currentColor;"
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
            style="margin-left: {labelLegend.position}%;">
            {labelLegend.label}: {labelLegend.value}
          </div>
        {/if}
        {#if hasSingleValueBucket(legendData) || legendData.hasNullValues}
        <div style="display: flex; flex-direction: row;">
          {#if hasSingleValueBucket(legendData)}
            <div
              style="display: flex; flex-direction: row; margin-right: 16px;"
              class="s-font-note-s">
              <svg
                width="11"
                height="11"
                style="margin-top:4px; margin-right: 8px;">
                <rect
                  width="11"
                  height="11"
                  class="s-color-gray-2"
                  fill="currentColor" />
              </svg>
              {legendData.buckets[0].from}
            </div>
          {/if}
          {#if legendData.hasNullValues}
            <div
              style="display: flex; flex-direction: row;"
              class="s-font-note-s">
              <svg
                width="11"
                height="11"
                style="margin-top:4px; margin-right: 8px;">
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
