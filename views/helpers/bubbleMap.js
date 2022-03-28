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

function getMathFunctionResult(mathFunction, baseMaps) {
  return mathFunction(
    ...baseMaps.map((item) => {
      return mathFunction(...item.data.entities.objects.features.geometries.map((geometry) => geometry.properties.population))
    })
  ) || 0;
}
