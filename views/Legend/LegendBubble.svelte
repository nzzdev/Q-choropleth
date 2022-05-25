<script>
  import Bubble from "../Geographic/Bubble.svelte";

  export let bubbleMapConfig;
  export let description;
  export let noteClass;
  export let population;

  $: radius = bubbleMapConfig.radiusFor(population) + 0.4; // compensate for the stroke width
</script>

<div class="legend-bubbles__bubble">
  <svg height={radius * 2} width={radius * 2}>
    <Bubble
      centroid={[radius, radius]}
      color={{}}
      config={bubbleMapConfig}
      {population}
    />
  </svg>
  <span
    class="legend-bubbles__bubble__description {noteClass}"
    class:legend-bubbles__bubble__description--big={population > 100000000}
  >
    {description}
  </span>
</div>

<style>
  .legend-bubbles__bubble {
    align-items: center;
    display: flex;
  }

  .legend-bubbles__bubble__description {
    margin-left: 4px;
  }

  .legend-bubbles__bubble__description--big {
    background-color: #fff;
    margin-left: -12px;
  }
</style>
