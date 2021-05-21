<script>
  import { round } from "../helpers/data.js";
  // Wrapper for a responsive SVG that also works in Internet Explorer
  export let aspectRatio;
</script>

<div class="svg-container" style="padding-top: {round(100 / aspectRatio)}%">
  <slot />
</div>

<style>
  .svg-container {
    position: relative;
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .svg-container :global(svg) {
    display: block;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
