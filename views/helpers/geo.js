import { geoPath, geoAlbersUsa, geoMercator } from "d3-geo";
import { geoRobinson } from "d3-geo-projection";
import { feature } from "topojson-client";

export function getGeoParameters(baseMap, width, maxHeight) {
  if (!baseMap) return undefined;
  
  const features = getFeatureCollection(baseMap.entities, "features");
  const outlines = getFeatureCollection(baseMap.entities, "outlines");
  const water = getFeatureCollection(baseMap.entities, "water");
  let projection = getProjection(baseMap).fitWidth(width, features);
  let path = geoPath(projection);
  let bounds = path.bounds(features);
  const height = bounds[1][1];

  if (height > maxHeight) {
    projection = getProjection(baseMap).fitHeight(maxHeight, features);
    path = geoPath(projection);
    bounds = path.bounds(features);
  }

  return { path, bounds, features, outlines, water };
}

function getProjection(baseMap) {
  if (baseMap.config.projection === "robinson") {
    return geoRobinson();
  } else if (baseMap.config.projection === "albersUsa") {
    return geoAlbersUsa();
  } else {
    return geoMercator();
  }
}

function getFeatureCollection(topojsonObject, objectName) {
  if (topojsonObject && topojsonObject.objects[objectName]) {
    return feature(topojsonObject, topojsonObject.objects[objectName]);
  }
  return makeFeatureCollection([]);
}

function makeFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features,
  };
}

export function roundCoordinatesInPath(path, precision = 1) {
  try {
    if (path) {
      return path.replace(/\d+\.\d+/g, (s) => parseFloat(s).toFixed(precision));
    }
  } catch (error) {
    console.log(error);
  }
}
