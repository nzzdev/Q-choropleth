import { scaleSqrt as d3ScaleSqrt } from "d3-scale";

export function getRadiusFunction(baseMap, cssModifier) {
  return d3ScaleSqrt()
    .domain(getPopulationSize(baseMap))
    .range(getScaleRange(cssModifier))
}

/**
 * Sort population by size (descending, so that the biggest bubbles are on the bottom).
 */
export function compareByPopulation(featureA, featureB) {
  let populationA = Number(featureA.properties.population);
  let populationB = Number(featureB.properties.population);
  if (populationA < populationB) return 1;
  if (populationA > populationB) return -1;
  return 0;
}

/**
 * Get min and max population size from all base maps.
 */
function getPopulationSize(baseMap) {
  if (!baseMap) return [0, 0];
  const baseMaps = [baseMap];

  if (baseMap.mobile) baseMaps.push(...baseMap.mobile);
  if (baseMap.miniMaps) baseMaps.push(...baseMap.miniMaps);

  return [
    getMathFunctionResult(Math.min, baseMaps),
    getMathFunctionResult(Math.max, baseMaps)
  ];
}

/**
 * Get range in px for scaleSqrt from d3-scale.
 */
function getScaleRange(cssModifier) {
  return [
    1.5,
    cssModifier === "extra-wide"
      ? 40
      : cssModifier === "wide" || cssModifier === "wide-plus"
        ? 25
        : 19
    ]
}

function getMathFunctionResult(mathFunction, baseMaps) {
  return mathFunction(
    ...baseMaps.map((item) => {
      return mathFunction(...item.data.entities.objects.features.geometries.map((geometry) => geometry.properties.population))
    })
  ) || 0;
}
