<script>
  import OpenIcon from "./svg/MethodBoxOpenIcon.svelte";
  import CloseIcon from "./svg/MethodBoxCloseIcon.svelte";
  import { getFormattedValueForBuckets } from "./helpers/data.js";
  export let legendData;
  export let formattingOptions;
  export let isStatic;
  export let methodBoxText;
  export let methodBoxArticle;

  let isMethodBoxOpen = false;

  function handleMethodBoxClicked(event) {
    isMethodBoxOpen = !isMethodBoxOpen;
    const trackingEvent = new CustomEvent("q-tracking-event", {
      bubbles: true,
      detail: {
        eventInfo: {
          componentName: "q-choropleth",
          eventAction: isMethodBoxOpen
            ? "close-methodbox-box"
            : "open-methodbox-box",
          eventNonInteractive: false,
        },
      },
    });
    event.target.dispatchEvent(trackingEvent);
  }

  function trackClickOnMethodBoxArticleLink(event) {
    const trackingEvent = new CustomEvent("q-tracking-event", {
      bubbles: true,
      detail: {
        eventInfo: {
          componentName: "q-choropleth",
          eventAction: "open-method-box-article-link",
          eventNonInteractive: false,
        },
      },
    });
    event.target.dispatchEvent(trackingEvent);
  }
</script>
<style>
.methodbox-link {
  display: flex;
  cursor: pointer;
  text-decoration: underline;
}

.methodbox-link:hover {
  opacity: 0.6;
}

.methodbox-link-text {
  margin-left: 4px;
}

.methodbox-description {
  margin-top: 4px;
}

.methodbox-circle {
  position: relative;
  box-sizing: content-box;
  width: 7px;
  height: 7px;
  margin: 2px 8px 2px 2px;
  border: 1px solid;
  border-radius: 50%;
}

.methodbox-circle--circle-fill {
  background-color: currentColor;
}

.methodbox-circle-static {
  margin-right: 8px;
}

.methodbox-box-static {
  margin-right: 20px;
}

.methodbox-article-container {
  margin-top: 4px;
}

.methodbox-article-link {
  color: #05032d;
}

.methodbox-container {
  margin-top: 8px;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f2;
  padding: 8px;
}

.methodbox-legend-table {
  table-layout: auto !important;
}

.methodbox-legend-table tr {
  text-align: right;
}

.methodbox-legend-table td {
  width: auto !important;
}
</style>

{#if isStatic}
  <div>
    <div class="s-font-title-s">Daten und Methodik</div>
    <div>
      <div class="s-legend-icon-label">
        {#each legendData.buckets as bucket, index}
          <div class="s-legend-item-label__item methodbox-box-static">
            <div
              class="{bucket.color.colorClass !== undefined ? bucket.color.colorClass : ''}
              methodbox-circle-static s-legend-item-label__item__icon
              s-legend-item-label__item__icon--default"
              style="color: {bucket.color.customColor !== undefined ? bucket.color.customColor : ''};" />
            <div class="s-legend-item-label__item__label s-font-note--tabularnums">
              {#if index === 0 && legendData.hasSingleValueBucket}
                {getFormattedValueForBuckets(formattingOptions, bucket.from)} (nur
                ein Datenpunkt)
              {:else}
                {getFormattedValueForBuckets(formattingOptions, bucket.from)}–{getFormattedValueForBuckets(formattingOptions, bucket.to)}
              {/if}
            </div>
          </div>
        {/each}
      </div>
      <div class="methodbox-description s-font-note-s">
        {methodBoxText}
      </div>
    </div>
  </div>
{:else}
  <div class="methodbox-link s-font-note-s" on:click={handleMethodBoxClicked}>
    {#if isMethodBoxOpen}
      <CloseIcon/>
    {:else}
      <OpenIcon/>
    {/if}
    <div class="methodbox-link-text">Daten und Methodik</div>
  </div>
  {#if isMethodBoxOpen} 
    <div class="methodbox-container s-font-note-s">
      <div class="methodbox-legend">
        <table class="methodbox-legend-table s-font-note--tabularnums">
          {#each legendData.buckets as bucket, index}
            <tr>
              <td>
                <div
                  class="{bucket.color.colorClass !== undefined ? bucket.color.colorClass : ''}
                  methodbox-circle
                  methodbox-circle--circle-fill"
                  style="color: {bucket.color.customColor !== undefined ? bucket.color.customColor : ''}" />
              </td>
              {#if index === 0 && legendData.hasSingleValueBucket}
                <td />
                <td />
                <td>
                  {getFormattedValueForBuckets(formattingOptions, bucket.from)}
                </td>
                <td>(nur ein Datenpunkt)</td>
              {:else}
                <td>
                  {getFormattedValueForBuckets(formattingOptions, bucket.from)}
                </td>
                <td>–</td>
                <td>
                  {getFormattedValueForBuckets(formattingOptions, bucket.to)}
                </td>
                <td />
              {/if}
            </tr>
          {/each}
        </table>
      </div>
      <div class="methodbox-description">{methodBoxText}</div>
      {#if methodBoxArticle}
        <div class="methodbox-article-container" on:click={trackClickOnMethodBoxArticleLink}>
          <a
            href={methodBoxArticle.url}
            target="_blank"
            rel="noopener noreferrer">
            {methodBoxArticle.title}
          </a>
        </div>
      {/if}
    </div>
  {/if}
{/if}
