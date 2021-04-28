<script>
  export let source;
  export let isStatic;
</script>

<div class="q-choropleth-attribution s-font-note-s">
  {#if isStatic}
    Kartengrundlage: {source.label}
  {:else}
    Kartengrundlage: <a href="{source.url}" target="_blank" rel="noopener noreferrer">{source.label}</a>
  {/if}
</div>
