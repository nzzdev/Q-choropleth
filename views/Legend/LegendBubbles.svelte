<script>
  import LegendBubble from "./LegendBubble.svelte";

  export let bubbleMapConfig;
  export let cssModifier;

  $: width = cssModifier === "wide-plus" || cssModifier === "extra-wide"
    ? "55%"
    : "100%";
</script>

<div class="legend-bubbles" style="width: {width}">
  <span class="s-font-note">Bevölkerung:</span>
  <LegendBubble
    {bubbleMapConfig}
    description="100 Tsd."
    population={100000}
  />
  <LegendBubble
    {bubbleMapConfig}
    description="100 Mio."
    population={100000000}
  />
  <LegendBubble
    {bubbleMapConfig}
    description="1 Mrd."
    population={1000000000}
  />
</div>

<style>
  .legend-bubbles {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }
</style>
