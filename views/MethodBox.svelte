<script>
  import OpenIcon from "./svg/MethodBoxOpenIcon.svelte";
  import CloseIcon from "./svg/MethodBoxCloseIcon.svelte";
  import { getFormatedValue } from "./helpers/data.js";
  export let legendData;
  export let methodBoxText;
  export let methodBoxArticle;
  export let hasFloatingNumbers;
</script>

<div class="q-choropleth-methods-link s-font-note-s">
  <span class="q-choropleth-methods-link-text">
    <OpenIcon />
    <CloseIcon />
    Daten und Methodik
  </span>
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
              {#if hasFloatingNumbers}
                {getFormatedValue(bucket.from)}
              {:else}{bucket.from}{/if}
            </td>
            <td>(nur ein Datenpunkt)</td>
          {:else}
            <td>
              {#if hasFloatingNumbers}
                {getFormatedValue(bucket.from)}
              {:else}{bucket.from}{/if}
            </td>
            <td>-</td>
            <td>
              {#if hasFloatingNumbers}
                {getFormatedValue(bucket.to)}
              {:else}{bucket.to}{/if}
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
