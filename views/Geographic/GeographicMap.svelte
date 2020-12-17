<script>
  import Feature from "./Feature.svelte";
  import OutlineFeature from "./OutlineFeature.svelte";
  import ResponsiveSvg from "../svg/ResponsiveSvg.svelte";
  import { getColor } from "../helpers/color.js";
  import { getGeoParameters, roundCoordinatesInPath } from "../helpers/geo.js";
  import { round } from "../helpers/data.js";

  export let dataMapping;
  export let entityType;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let baseMap;
  export let formattingOptions;

  const maxHeight = 550;
  const geoParameters = getGeoParameters(baseMap, contentWidth, maxHeight);
  const bounds = geoParameters.bounds;
  const height = round(bounds[1][1]);
  const viewBox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]]
    .map(value => round(value))
    .join(" ");
</script>

<ResponsiveSvg aspectRatio={contentWidth / height}>
  <svg viewbox={viewBox}>
    <g class="q-choropleth-features">
      {#each geoParameters.features.features as feature}
        <Feature
          color={getColor(dataMapping.get(feature.properties[entityType]), legendData)}
          path={roundCoordinatesInPath(geoParameters.path(feature), 1)} />
      {/each}
    </g>
    {#if geoParameters.outlines.features !== undefined}
      <g class="q-choropleth-outlines">
        {#each geoParameters.outlines.features as outline}
          <OutlineFeature
            path={roundCoordinatesInPath(geoParameters.path(outline), 1)} />
        {/each}
      </g>
    {/if}
  </svg>
</ResponsiveSvg>
