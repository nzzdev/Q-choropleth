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
  <div id="{id}_container" class="q-choropleth-container" />
  <Footer {item} />
</div>

<style>
  /* Reserves space (16/9) for choropleth graphic
     Adjust to the actual height of the graphic as soon as its rendered
     See https://matthiasott.com/notes/aspect-ratio-in-css for more details
  */
  .q-choropleth-container::before {
    content: "";
    padding-top: 56.25%;
    float: left;
  }

  .q-choropleth-container::after {
    clear: left;
    content: " ";
    display: table;
  }
</style>
