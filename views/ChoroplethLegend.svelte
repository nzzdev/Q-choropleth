<script>
  export let legendData;

  const legendBarHeight = 8;
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
  {#if legendData.type === 'qualitative'}
    <!-- display categorical legend -->
    <div class="s-legend-icon-label">
      {#each legendData.categories as category}
        <div
          class="s-legend-item-label__item {category.sophieColor !== undefined ? category.sophieColor : ''}"
          style="color: {category.colorOverwrite !== undefined ? category.colorOverwrite : ''}">
          <div
            class="s-legend-item-label__item__icon
            s-legend-item-label__item__icon--default" />
          <div class="s-legend-item-label__item__label">{category.label}</div>
        </div>
      {/each}
    </div>
  {:else if legendData.type === 'quantitative'}
    <!-- display bucket legend -->
    <div class="q-choropleth-legend-container">
      {#if hasSingleValueBucket(legendData)}
        <svg class="q-choropleth-single-value-bucket">
          <g>
            <rect
              class="q-choropleth-legend-bucket {legendData.buckets[0].colorClass}"
              width={singleValueBucketWidth}
              height={legendBarHeight}
              x="0"
              y="24" />
          </g>
        </svg>
      {/if}
      <svg class="q-choropleth-legend">
        <g>
          {#each legendData.buckets as bucket, index}
            {#if !(hasSingleValueBucket(legendData) && index === 0)}
              <rect
                class="q-choropleth-legend-bucket {bucket.colorClass}"
                width="{getAspectWidth(legendData, bucket)}%"
                height={legendBarHeight}
                x="{getAspectXValue(legendData, bucket)}%"
                y="24" />
            {/if}
          {/each}
        </g>
      </svg>
    </div>
  {/if}
{/if}
