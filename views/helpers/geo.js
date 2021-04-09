const geo = require("d3-geo");
const geoProjection = require("d3-geo-projection");
const topojson = require("topojson");

function getGeoParameters(baseMap, width, maxHeight) {
  const features = getFeatureCollection(baseMap.entities, "features");
  const outlines = getFeatureCollection(baseMap.entities, "outlines");
  const water = getFeatureCollection(baseMap.entities, "water");
  let projection = getProjection(baseMap).fitWidth(width, features);
  let path = geo.geoPath(projection);
  let bounds = path.bounds(features);
  const height = bounds[1][1];

  if (height > maxHeight) {
    projection = getProjection(baseMap).fitHeight(maxHeight, features);
    path = geo.geoPath(projection);
    bounds = path.bounds(features);
  }

  return { path, bounds, features, outlines, water };
}

function getProjection(baseMap) {
  if (baseMap.config.projection === "robinson") {
    return geoProjection.geoRobinson();
  } else if (baseMap.config.projection === "albersUsa") {
    return geo.geoAlbersUsa();
  } else {
    return geo.geoMercator();
  }
}

function getFeatureCollection(topojsonObject, objectName) {
  if (topojsonObject && topojsonObject.objects[objectName]) {
    return topojson.feature(topojsonObject, topojsonObject.objects[objectName]);
  }
  return makeFeatureCollection([]);
}

function makeFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features,
  };
}

function roundCoordinatesInPath(path, precision = 1) {
  try {
    if (path) {
      return path.replace(/\d+\.\d+/g, (s) => parseFloat(s).toFixed(precision));
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getGeoParameters,
  roundCoordinatesInPath,
};
