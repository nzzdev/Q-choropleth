<script>
  import Footer from "./Footer.svelte";

  export let item;
  export let id;
  export let displayOptions;
</script>

<div class="s-q-item q-choropleth">
  {#if !displayOptions.hideTitle}
    <h3 class="s-q-item__title">{item.title}</h3>
  {/if}
  {#if item.subtitle || item.subtitleSuffix}
    <div class="s-q-item__subtitle">
      {#if item.subtitle}{item.subtitle}{/if}
      {#if item.subtitleSuffix}{item.subtitleSuffix}{/if}
    </div>
  {/if}
  <div id="{id}_container" />
  <Footer {item} />
</div>
