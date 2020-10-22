<script>
  import OpenIcon from "./svg/MethodBoxOpenIcon.svelte";
  import CloseIcon from "./svg/MethodBoxCloseIcon.svelte";
  import { getFormattedValueForBuckets } from "./helpers/data.js";
  export let legendData;
  export let formattingOptions;
  export let noInteraction;
  export let methodBoxText;
  export let methodBoxArticle;
</script>

{#if noInteraction}
  <div class="s-font-note">Daten und Methodik</div>
  <div>
    <div
      style="display: flex; flex-direction: row; flex-wrap: wrap; margin-top:
      4px;">
      {#each legendData.buckets as bucket, index}
        <div
          style="display: flex; flex-direction: row; flex-wrap: nowrap;
          margin-right: 20px; justify-content: center; align-items: center;">
          <div
            class="{bucket.color.colorClass !== undefined ? bucket.color.colorClass : ''}
            q-choropleth-methods-circle q-choropleth-methods-circle--circle-fill"
            style="color: {bucket.color.customColor !== undefined ? bucket.color.customColor : ''};" />
          <div
            class="s-font-note"
            style="justify-content: center; align-items: center;">
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
{:else}
  <div class="q-choropleth-methods-link s-font-note-s">
    <OpenIcon />
    <CloseIcon />
    <div class="q-choropleth-methods-link-text">Daten und Methodik</div>
  </div>
  <div class="q-choropleth-methods-container hidden s-font-note-s">
    <div class="q-choropleth-methods-legend">
      <table class="q-choropleth-methods-legend-table">
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
              <td>-</td>
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
      <div class="q-choropleth-methods-article-container">
        <a
          href={methodBoxArticle.url}
          class="q-choropleth-methods-article-link"
          target="_blank"
          rel="noopener noreferrer">
          {methodBoxArticle.title}
        </a>
      </div>
    {/if}
  </div>
{/if}
