import { geoPath, geoAlbersUsa, geoMercator, geoIdentity } from "d3-geo";
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

  for (const feature of features.features) {
    if (feature.properties.centroid_lat && feature.properties.centroid_lon) {
      // If we already have a centroid, use that
      feature.properties.centroidPlanar = projection([feature.properties.centroid_lat, feature.properties.centroid_lon]);
      feature.properties.centroidSpherical = [feature.properties.centroid_lat, feature.properties.centroid_lon];
      delete feature.properties.centroid_lat;
      delete feature.properties.centroid_lon;
    } else {
      // Otherwise, calculate it from the geometry
      feature.properties.centroidPlanar = path.centroid(feature);
    }
  }
  
  return { path, bounds, features, outlines, water };
}

function getProjection(baseMap) {
  if (baseMap.config.projection === "robinson") {
    return geoRobinson();
  } else if (baseMap.config.projection === "albersUsa") {
    return geoAlbersUsa();
  } else if (baseMap.config.projection === "mercator") {
    return geoMercator();
  } else if (baseMap.config.projection === "d3.geoIdentity") {
    // since the baseMap is already in projected coordinates, we just need to adjust it to the viewport — this is why we use d3.geoIdentity
    return geoIdentity();
  } else {
    throw new Error(`Projection '${baseMap.config.projection}' is not supported.`);
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
    // nevermind
  }
}
