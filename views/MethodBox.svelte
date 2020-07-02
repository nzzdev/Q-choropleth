<script>
  import OpenIcon from "./svg/MethodBoxOpenIcon.svelte";
  import CloseIcon from "./svg/MethodBoxCloseIcon.svelte";
  export let legendData;
  export let methodBoxArticle;

  function handleLinkClick(event) {
    const trackingEvent = new CustomEvent("q-tracking-event", {
      bubbles: true,
      detail: {
        eventInfo: {
          componentName: "q-choropleth",
          eventAction: `click-on-method-article-url`,
          eventNonInteractive: false
        }
      }
    });
    event.target.dispatchEvent(trackingEvent);
  }

  function getSpanWidth(maxValue) {
    return maxValue.toString().length * 7;
  }
</script>

<div class="q-choropleth-methods-link s-font-note-s">
  <span class="q-choropleth-methods-link-text">
    <OpenIcon />
    <CloseIcon />
    Daten und Methodik
  </span>
</div>
<div class="q-choropleth-methods-container s-font-note-s">
  <div class="q-choropleth-methods-item">
    {#each legendData.buckets as bucket, index}
      <div style="display: flex; flex-direction: row;">
        <div
          class="q-choropleth-methods-cirlcle
          q-choropleth-methods-cirlcle--circle-fill {bucket.color.colorClass}" />
        {#if index === 0 && legendData.hasSingleValueBucket}
          <div class="q-choropleth-methods-buckets">
            {bucket.from} (nur ein Datenpukt)
          </div>
        {/if}
        <div class="q-choropleth-methods-buckets">
          <div
            class="q-choropleth-methods-buckets-values"
            style="width: {getSpanWidth(legendData.maxValue)}px;">
            {bucket.from}
          </div>
          <span class="q-choropleth-methods-buckets--separator">-</span>
          <div
            class="q-choropleth-methods-buckets-values"
            style="width: {getSpanWidth(legendData.maxValue)}px;">
            {bucket.to}
          </div>
        </div>
      </div>
    {/each}
  </div>
  <div class="q-choropleth-methods-description">
    Text zu den Buckets. (Muss unterschieden werden zwischen Jenks, Quantiles,
    gleich grosse Intervallle und manuelle Grenzen)
  </div>
  {#if methodBoxArticle}
    <div class="q-choropleth-methods-article-container">
      <a
        href={methodBoxArticle.url}
        on:click={handleLinkClick}
        class="q-choropleth-methods-article-link">
        {methodBoxArticle.title}
      </a>
    </div>
  {/if}
</div>
