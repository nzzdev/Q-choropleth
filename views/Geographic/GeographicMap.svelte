<script>
  import Feature from "./Feature.svelte";
  import { getColor } from "../helpers/color.js";
  import { getFeatureCollection, fitProjection } from "../helpers/geo.js";

  export let dataMapping;
  export let entityType;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let baseMap;
  export let formattingOptions;

  const featureCollection = getFeatureCollection(baseMap.entities, "features");

  const projection = fitProjection(contentWidth, featureCollection);
</script>

<div>
  <svg style="height: {projection.height}px; width: 100%;">
    {#each featureCollection.features as feature}
      <Feature
        color={getColor(dataMapping.get(feature.properties[entityType]), legendData)}
        path={projection.path(feature)} />
    {/each}
  </svg>
</div>
