<script>
  import Bubble from "./Bubble.svelte";
  import Feature from "./Feature.svelte";
  import OutlineFeature from "./OutlineFeature.svelte";
  import WaterFeature from "./WaterFeature.svelte";
  import ResponsiveSvg from "../svg/ResponsiveSvg.svelte";
  import { compareByPopulation } from "../helpers/bubbleMap.js";
  import { getColor } from "../helpers/color.js";
  import { roundCoordinatesInPath } from "../helpers/geo.js";
  import { regionHasAnnotation } from "../helpers/annotations";

  export let annotations = [];
  export let bubbleMapConfig;
  export let dataMapping;
  export let entityType;
  export let legendData;
  export let geoParameters;
  export let svgSize;
  export let title = undefined;

  let featuresWithAnnotation = [],
      featuresWithoutAnnotation = [];
  $: {
    if (bubbleMapConfig) {
      geoParameters?.features.features.sort(compareByPopulation);
    }
    featuresWithoutAnnotation = getFeaturesWithoutAnnotation(geoParameters?.features.features, annotations, entityType);
    featuresWithAnnotation = getFeaturesWithAnnotation(geoParameters?.features.features, annotations, entityType);
  }

  function getFeaturesWithoutAnnotation(features, annotations, entityType) {
    if (!features) return [];
    return features.filter((f) => {
      return !regionHasAnnotation(annotations, f.properties[entityType]);
    });
  }

  function getFeaturesWithAnnotation(features, annotations, entityType) {
    if (!features) return [];
    return features.filter((f) => {
      return regionHasAnnotation(annotations, f.properties[entityType]);
    });
  }
</script>

<ResponsiveSvg aspectRatio={svgSize.aspectRatio}>
  <svg
    class="s-viz-color-nebel"
    class:choropleth-geographic--border={title}
    viewbox={svgSize.viewBox}
  >
    {#if geoParameters}
      <g>
        {#if bubbleMapConfig}
          {#each geoParameters.features.features as feature}
            <Feature
              color={getColor(undefined, legendData)}
              path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
              showBubbleMap={true}
            />
          {/each}
          {#each featuresWithoutAnnotation as feature}
            {#if dataMapping.get(feature.properties[entityType]) && feature.properties?.status !== "ignore"}
              <Bubble
                centroid={feature.properties.centroidPlanar}
                color={getColor(
                  dataMapping.get(feature.properties[entityType]),
                  legendData
                )}
                config={bubbleMapConfig}
                population={feature.properties.population}
              />
            {/if}
          {/each}
        {:else}
          {#each featuresWithoutAnnotation as feature}
            {#if feature.properties?.status !== "ignore"}
              <Feature
                color={getColor(
                  dataMapping.get(feature.properties[entityType]),
                  legendData
                )}
                value={dataMapping.get(feature.properties[entityType])}
                path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
              />
            {:else}
              <Feature
                color={getColor(undefined, legendData)}
                path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
              />
            {/if}
          {/each}
        {/if}
      </g>
      {#if geoParameters.outlines.features !== undefined}
        <g>
          {#each geoParameters.outlines.features as outline}
            <OutlineFeature
              path={roundCoordinatesInPath(geoParameters.path(outline), 1)}
            />
          {/each}
        </g>
      {/if}
      {#if geoParameters.water.features !== undefined}
        <g>
          {#each geoParameters.water.features as water}
            <WaterFeature
              path={roundCoordinatesInPath(geoParameters.path(water), 1)}
            />
          {/each}
        </g>
      {/if}
      {#if annotations && annotations.length > 0}
        <g class="choropleth-annotations">
          <!--
            Features with annotations are added here, so the border around them is drawn correctly.
          -->
          {#if bubbleMapConfig}
            {#each featuresWithAnnotation as feature}
              {#if dataMapping.get(feature.properties[entityType]) && feature.properties?.status !== "ignore"}
                <Bubble
                  centroid={feature.properties.centroidPlanar}
                  color={getColor(
                    dataMapping.get(feature.properties[entityType]),
                    legendData
                  )}
                  config={bubbleMapConfig}
                  hasAnnotation={true}
                  population={feature.properties.population}
                />
              {/if}
            {/each}
          {:else}
            {#each featuresWithAnnotation as feature}
              {#if feature.properties?.status !== "ignore"}
                <Feature
                  color={getColor(
                    dataMapping.get(feature.properties[entityType]),
                    legendData
                  )}
                  hasAnnotation={true}
                  value={dataMapping.get(feature.properties[entityType])}
                  path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
                />
              {:else}
                <Feature
                  color={getColor(undefined, legendData)}
                  path={roundCoordinatesInPath(geoParameters.path(feature), 1)}
                />
              {/if}
            {/each}
          {/if}
        </g>
      {/if}
    {/if}
  </svg>
</ResponsiveSvg>
{#if title}
  <div class="choropleth-geographic__title s-font-note-s s-viz-color-regen">
    {title}
  </div>
{/if}

<style>
  .choropleth-geographic--border {
    border: 1px solid currentColor;
    padding: 4px;
  }

  .choropleth-geographic__title {
    text-align: center;
  }
</style>
