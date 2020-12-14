<script>
  import { round } from "../helpers/data.js";
  // Wrapper for a responsive SVG that also works in Internet Explorer
  export let aspectRatio;
</script>

<div
  class="q-choropleth-svg-container"
  style="padding-top: {round(100 / aspectRatio)}%">
  <slot />
</div>
