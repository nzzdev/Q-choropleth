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
export function getPopulationSize(baseMap) {
  const retVal = {
    max: 0,
    min: 0,
  }
  if (!baseMap) return retVal;
  const baseMaps = [baseMap];

  if (baseMap.mobile) baseMaps.push(...baseMap.mobile);
  if (baseMap.miniMaps) baseMaps.push(...baseMap.miniMaps);

  retVal.max = getMathFunctionResult(Math.max, baseMaps);
  retVal.min = getMathFunctionResult(Math.min, baseMaps);

  return retVal;
}

/**
 * Get range in px for scaleSqrt from d3-scale.
 */
export function getScaleRange(cssModifier) {
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
