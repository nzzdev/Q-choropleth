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
    {#each legendData.buckets as bucket}
      <div class="q-choropleth-methods-buckets">
        {bucket.from} - {bucket.to}
      </div>
    {/each}
    Text zu den Buckets. (Muss unterschieden werden zwischen Jenks, Quantiles,
    gleich grosse Intervallle und manuelle Grenzen)
  </div>
  <div class="q-choropleth-methods-article-container">
    <a
      href={methodBoxArticle.url}
      on:click={handleLinkClick}
      class="q-choropleth-methods-article-link">
      {methodBoxArticle.title}
    </a>
  </div>
</div>
