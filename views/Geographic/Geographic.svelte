<script>
  import Feature from "./Feature.svelte";
  import { getColor } from "../helpers/color.js";
  import { getFeatureCollection, fitProjection } from "../helpers/geo.js";

  export let data;
  export let entityType;
  export let legendData;
  export let valuesOnMap;
  export let contentWidth;
  export let entityCollectionInfo;
  export let formattingOptions;

  const dataMapping = new Map(data);
  const featureCollection = getFeatureCollection(
    entityCollectionInfo.features,
    "features"
  );

  const projection = fitProjection(contentWidth, featureCollection);

  function getValue(properties) {
    const dataMapping = new Map(data);
    return dataMapping.get(properties[entityType]);
  }
</script>

<div>
  <svg style="height: {projection.height}px; width: 100%;">
    {#each featureCollection.features as feature}
      <Feature
        color={getColor(getValue(feature.properties), legendData)}
        path={projection.path(feature)} />
    {/each}
  </svg>
</div>
