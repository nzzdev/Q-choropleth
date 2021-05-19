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
            ? "close-methods-box"
            : "open-methods-box",
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

{#if isStatic}
  <div class="q-choropleth-methods-static">
    <div class="s-font-title-s">Daten und Methodik</div>
    <div>
      <div class="s-legend-icon-label">
        {#each legendData.buckets as bucket, index}
          <div class="s-legend-item-label__item q-choropleth-methods-box-static">
            <div
              class="{bucket.color.colorClass !== undefined ? bucket.color.colorClass : ''}
              q-choropleth-methods-circle-static s-legend-item-label__item__icon
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
      <div class="q-choropleth-methods-description s-font-note-s">
        {methodBoxText}
      </div>
    </div>
  </div>
{:else}
  <div class="q-choropleth-methods-link s-font-note-s" on:click={handleMethodBoxClicked}>
    <OpenIcon {isMethodBoxOpen}/>
    <CloseIcon {isMethodBoxOpen}/>
    <div class="q-choropleth-methods-link-text">Daten und Methodik</div>
  </div>
  {#if isMethodBoxOpen} 
    <div class="q-choropleth-methods-container s-font-note-s">
      <div class="q-choropleth-methods-legend">
        <table class="q-choropleth-methods-legend-table s-font-note--tabularnums">
          {#each legendData.buckets as bucket, index}
            <tr>
              <td>
                <div
                  class="{bucket.color.colorClass !== undefined ? bucket.color.colorClass : ''}
                  q-choropleth-methods-circle
                  q-choropleth-methods-circle--circle-fill"
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
      <div class="q-choropleth-methods-description">{methodBoxText}</div>
      {#if methodBoxArticle}
        <div class="q-choropleth-methods-article-container" on:click={trackClickOnMethodBoxArticleLink}>
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
