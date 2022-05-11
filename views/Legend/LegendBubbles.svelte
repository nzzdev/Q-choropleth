<script>
  import LegendBubble from "./LegendBubble.svelte";

  export let bubbleMapConfig;
  export let cssModifier;

  $: noteClass = cssModifier === "wide-plus" || cssModifier === "extra-wide"
    ? "s-font-note"
    : "s-font-note-s";
  $: width = cssModifier === "wide-plus" || cssModifier === "extra-wide"
    ? "55%"
    : "100%";
</script>

<div class="legend-bubbles" style="width: {width}">
  <span class="{noteClass}">Bevölkerung:</span>
  <LegendBubble
    {bubbleMapConfig}
    description="100 Tsd."
    {noteClass}
    population={100000}
  />
  <LegendBubble
    {bubbleMapConfig}
    description="100 Mio."
    {noteClass}
    population={100000000}
  />
  <LegendBubble
    {bubbleMapConfig}
    description="1 Mrd."
    {noteClass}
    population={1000000000}
  />
</div>

<style>
  .legend-bubbles {
    align-items: center;
    display: flex;
    justify-content: space-between;
    max-width: 380px;
  }
</style>
