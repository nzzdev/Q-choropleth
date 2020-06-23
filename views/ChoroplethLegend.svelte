<script>
  export let legendData;

  const legendBarHeight = 12;
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
    <div class="q-choropleth-legend-container">
      {#if hasSingleValueBucket(legendData)}
        <svg class="q-choropleth-single-value-bucket">
          <g>
            <rect
              class="q-choropleth-legend-bucket {legendData.buckets[0].color.colorClass}"
              style="fill: {legendData.buckets[0].color.customColor}"
              width={singleValueBucketWidth}
              height={legendBarHeight}
              x="0"
              y="20" />
          </g>
        </svg>
      {/if}
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
                y="20" />
            {/if}
          {/each}
        </g>
        <g>          
          <rect
                class="s-color-gray-9"
                style="fill: currentColor;"
                width="0.5px"
                height={legendBarHeight * 2}
                x="0%"
                y="12" />
          <text class="s-font-note" x="0%" y="0">1</text>
        </g>
        <g>
          <rect
                class="s-color-gray-9"
                style="fill: currentColor;"
                width="0.5px"
                height={legendBarHeight * 2}
                x="99.92%"
                y="12" />
          <text class="s-font-note" x="99%" y="0">100</text>
        </g>
      </svg>
    </div>
  {/if}
{/if}
