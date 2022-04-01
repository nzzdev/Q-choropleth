import { getExtents } from "../helpers/extent.js";
import booleanOverlap from "@turf/boolean-overlap";
import { geoCentroid as d3centroid } from "d3-geo";

export const RADIUS = 8;
const MARGINS_BETWEEN_ANNOTATIONS = 2;

/**
 * Returns true, if there is at least one annotation on the left or on the right.
 * On narrow viewports (such as mobile screens) no annotations are displayed on the left or right.
 */
export function hasAnnotationOnLeftOrRight(annotations, cssModifier) {
  if (cssModifier === "narrow") return false;
  return annotations.some(
    (a) => a.position === "left" || a.position === "right"
  );
}

/**
 * Returns true, if there is at least one annotation on the top or on the bottom.
 * On narrow viewports (such as mobile screens) all annotations are displayed on top or bottom.
 */
export function hasAnnotationOnTopOrBottom(annotations, cssModifier) {
  if (cssModifier === "narrow" && annotations.length > 0) return true;
  return annotations.some(
    (a) => a.position === "top" || a.position === "bottom"
  );
}

/**
 * Returns true, if the region (Kanton, Landkreis, etc.) has at least one annotation.
 */
export function regionHasAnnotation(annotations, region) {
  return annotations.some((annotation) => {
    return annotation.regions.some((r) => r.id === region);
  });
}

/**
 * Links the annotations to the hexagons and sets all the coordinates needed for drawing the annotations correctly
 */
export function getAnnotationsForHexMap(
  annotations,
  hexagons,
  annotationStartPosition,
  cssModifier
) {
  let annotationLines = [];

  const [xMin, xMax] = getExtents(hexagons, ({ x }) => x);
  const [yMin, yMax] = getExtents(hexagons, ({ y }) => y);

  // Grid to store already placed annotations.
  const grid = [];

  annotations.forEach((annotation) => {
    let annotationLine = {
      id: annotation.id,
      position: annotation.position,
      coordinates: [],
    };

    annotation.regions.forEach((region) => {
      let hexagon = hexagons.find((h) => h.text[0] === region.id);

      if (hexagon) {
        let horizontalIncrement = hexagon.width / 4;
        let verticalIncrement = hexagon.height / 4;
        let coordinates;

        if (
          annotation.position === "top" ||
          (cssModifier === "narrow" && annotation.position === "left")
        ) {
          coordinates = getDrawingCoordinatesForTopAnnotation(
            hexagon.x + horizontalIncrement,
            hexagon.y,
            yMin,
            verticalIncrement,
            annotationStartPosition,
            xMax,
            grid
          );
        } else if (
          annotation.position === "bottom" ||
          (cssModifier === "narrow" && annotation.position === "right")
        ) {
          coordinates = getDrawingCoordinatesForBottomAnnotation(
            hexagon.x + (horizontalIncrement * 3),
            hexagon.y,
            yMax,
            hexagon.height,
            verticalIncrement,
            annotationStartPosition,
            xMax,
            grid
          );
        } else if (annotation.position === "left") {
          coordinates = getDrawingCoordinatesForLeftAnnotation(
            hexagon.x,
            hexagon.y + verticalIncrement,
            xMin,
            annotationStartPosition,
            yMax,
            grid
          );
        } else if (annotation.position === "right") {
          coordinates = getDrawingCoordinatesForRightAnnotation(
            hexagon.x,
            hexagon.y + verticalIncrement,
            xMax,
            hexagon.width,
            annotationStartPosition,
            yMax,
            grid
          );
        }

        annotationLine.coordinates.push(coordinates);
      }
    });

    annotationLines.push(annotationLine);

    annotationLines = removeDoubleAxisCoordinates(annotationLines, cssModifier);

    grid.push({
      x: annotationLine.coordinates[0].x,
      y: annotationLine.coordinates[0].y,
    });
  });

  return annotationLines;
}
/**
 * Links the annotations to the features of the geo map and sets all the coordinates needed for drawing the annotations correctly
 */
export function getAnnotationsForGeoMap(
  annotations,
  geoParameters,
  entityType,
  annotationStartPosition,
  cssModifier
) {
  if (!geoParameters) return [];
  let path = geoParameters.path;
  let features = geoParameters.features.features;
  let yMax = geoParameters.bounds[1][1];
  let xMax = geoParameters.bounds[1][0];
  let annotationLines = [];

  // Grid to store already placed annotations.
  const grid = [];

  annotations.forEach((annotation) => {
    let annotationLine = {
      id: annotation.id,
      position: annotation.position,
      coordinates: [],
    };

    // Find all the geojsons of the selected regions.
    const foundRegions = [];
    annotation.regions.forEach(region => {
      let feature = features.find(
        (f) => f.properties[entityType] === region.id
      );

      if (feature) {
        foundRegions.push(feature);
      }
    });

    // Cluster regions into ones that only neighbour each-other.
    const clusters = clusterNeighbouringRegions(foundRegions);

    // For each cluster find the center point.
    const clusterCenterPointFeatures = [];
    
    clusters.forEach(cluster => {
      const features = cluster.map(feature => {
        // If there is already a centroid, use it
        if (feature.properties.centroidSpherical) {
          return {
            "type": "Feature",
            geometry: {
              type: "Point",
              coordinates: feature.properties.centroidSpherical
            }
          }
        } else {
          return feature;
        }
      });
      const clusterCenterPointCoordinates = d3centroid({
        "type": "FeatureCollection",
        "features": features
      });

      clusterCenterPointFeatures.push({
        "type": "Feature",
        geometry: {
          type: "Point",
          coordinates: clusterCenterPointCoordinates
        }
      });
    });

    // For each center point create the coordinates for the line.
    clusterCenterPointFeatures.forEach(centerPointFeature => {
      const centroid = path.centroid(centerPointFeature);
      const x = centroid[0];
      const y = centroid[1];
      let coordinates;

      if (annotation.position === "top" || annotation.position === "left") {
        // If contentWidth (cssModifier) is narrow, all annotations on the left will be drawn on the top
        coordinates = getDrawingCoordinatesForTopAnnotation(x, y, 0, 0, annotationStartPosition, xMax, grid);

        if (cssModifier !== "narrow" && annotation.position === "left") {
          coordinates = getDrawingCoordinatesForLeftAnnotation(x, y, 0, annotationStartPosition, yMax, grid);
        }
      } else {
        // If contentWidth (cssModifier) is narrow, all annotations on the right will be drawn on the bottom
        coordinates = getDrawingCoordinatesForBottomAnnotation(x, y, yMax, 0, 0, annotationStartPosition, xMax, grid);

        if (cssModifier !== "narrow" && annotation.position === "right") {
          coordinates = getDrawingCoordinatesForRightAnnotation(x, y, xMax, 0, annotationStartPosition, yMax, grid);
        }
      }

      grid.push({
        x: coordinates.x,
        y: coordinates.y
      });

      annotationLine.coordinates.push(coordinates);
    });

    annotationLines.push(annotationLine);
  });

  annotationLines = removeDoubleAxisCoordinates(annotationLines, cssModifier);

  return annotationLines;
}

/**
 * Returns the coordinates of the connection line between the multiple annotations
 */
export function getConnectionLineCoordinates(
  annotationLine,
  annotationPosition,
  annotationRadius,
  cssModifier
) {
  let firstRegion = annotationLine.coordinates[0];
  let lastRegion =
    annotationLine.coordinates[annotationLine.coordinates.length - 1];
  if (
    annotationPosition === "top" ||
    (cssModifier === "narrow" && annotationPosition === "left")
  ) {
    return {
      lineX1: firstRegion.lineX1 + annotationRadius,
      lineX2: lastRegion.lineX1 - annotationRadius,
      lineY1: firstRegion.lineY1 - annotationRadius,
      lineY2: firstRegion.lineY1 - annotationRadius,
    };
  } else if (
    annotationPosition === "bottom" ||
    (cssModifier === "narrow" && annotationPosition === "right")
  ) {
    return {
      lineX1: firstRegion.lineX1 + annotationRadius,
      lineX2: lastRegion.lineX1 - annotationRadius,
      lineY1: firstRegion.lineY1 + annotationRadius,
      lineY2: firstRegion.lineY1 + annotationRadius,
    };
  } else if (annotationPosition === "left") {
    return {
      lineX1: firstRegion.lineX1 - annotationRadius,
      lineX2: firstRegion.lineX1 - annotationRadius,
      lineY1: firstRegion.lineY1 + annotationRadius,
      lineY2: lastRegion.lineY1 - annotationRadius,
    };
  } else if (annotationPosition === "right") {
    return {
      lineX1: firstRegion.lineX2 + annotationRadius,
      lineX2: firstRegion.lineX2 + annotationRadius,
      lineY1: firstRegion.lineY1 + annotationRadius,
      lineY2: lastRegion.lineY1 - annotationRadius,
    };
  }
}

/**
 * 
 * @param {*} mapAnnotations 
 * @returns 
 */
export function getMutatedAnnotations(mapAnnotations) {
  if (!mapAnnotations) return [];
  return mapAnnotations.map((value, index) => {
    value.id = index + 1;
    value.regions = value.regions.map((region) => {
      return { id: region };
    });
    return value;
  });
}

/**
 * 
 * @param {*} annotations 
 * @param {*} baseMap 
 * @returns 
 */
export function filterAnnotationsByBaseMap(annotations, baseMap) {
  if (!annotations || !baseMap) return [];
  const localCopy = [...annotations];
  const retVal = localCopy.filter((annotation) => {
    localCopy.regions = annotation.regions.filter((region) => {
      return baseMap.data.entities.objects.features.geometries.some((feature) => {
        if (feature.properties.name === region.id) return true;
        return false;
      });
    });
    if (localCopy.regions.length === 0) return false;
    return true;
  });
  return retVal;
}

function getDrawingCoordinatesForTopAnnotation(featureX, featureY, yMin, verticalIncrement, annotationStartPosition, maxWidthChart, grid) {
  const y = yMin - annotationStartPosition;
  let x = findNearestAvailableSpotHorizontally(featureX, y, maxWidthChart, grid);

  const coords = {
    x,
    y,
    lineX1: x,
    lineY1: yMin - (annotationStartPosition / 2),
    lineX2: featureX,
    lineY2: featureY + (verticalIncrement / 2),
    featureX: featureX,
    featureY: featureY,
  };

  return coords;
}

function getDrawingCoordinatesForBottomAnnotation(featureX, featureY, yMax, hexHeight, verticalIncrement, annotationStartPosition, maxWidthChart, grid) {
  const y = yMax + hexHeight + annotationStartPosition;
  let x = findNearestAvailableSpotHorizontally(featureX, y, maxWidthChart, grid);

  const coords = {
    x,
    y,
    lineX1: x,
    lineY1: yMax + hexHeight + annotationStartPosition / 2,
    lineX2: featureX,
    lineY2: featureY + hexHeight - verticalIncrement / 2,
    featureX: featureX,
    featureY: featureY,
  };

  return coords;
}

function getDrawingCoordinatesForLeftAnnotation(featureX, featureY, xMin, annotationStartPosition, maxHeightChart, grid) {
  const x = xMin - annotationStartPosition;
  let y = findNearestAvailableSpotVertically(x, featureY, maxHeightChart, grid);

  const coords = {
    x,
    y,
    lineX1: xMin - (annotationStartPosition / 2),
    lineY1: y,
    lineX2: featureX,
    lineY2: featureY,
    featureX: featureX,
    featureY: featureY,
  };

  return coords;
}

function getDrawingCoordinatesForRightAnnotation(featureX, featureY, xMax, hexWidth, annotationStartPosition, maxHeightChart, grid) {
  const x = xMax + hexWidth + annotationStartPosition;
  let y = findNearestAvailableSpotVertically(x, featureY, maxHeightChart, grid);

  const coords = {
    x,
    y,
    lineX1: featureX + hexWidth,
    lineY1: featureY,
    lineX2: xMax + hexWidth + (annotationStartPosition / 2),
    lineY2: y,
    featureX: featureX,
    featureY: featureY,
  };

  return coords;
}

/**
 *
 * @param {Number} maxWidth Max width of chart.
 * @param {Number} startX StartX of point that is blocking us.
 * @param {Number} startY Start y of the point that is blocking us.
 * @returns {Number}
 */
function findNearestAvailableSpotHorizontally(startX, startY, maxWidth, grid) {
  // Go to the end of the chart and try to find a free spot.
  for (let i = startX; i < maxWidth - RADIUS; i++) {
    if (annotionOverlaps(grid, i, startY) !== true) {
      return i;
    }
  }

  // If no space is found from the startX to the end of the chart, look from
  // the startX to the beginning of the chart.
  for (let i = startX; i > RADIUS; i--) {
    if (annotionOverlaps(grid, i, startY) !== true) {
      return i;
    }
  }

  return startX;
}

function findNearestAvailableSpotVertically(startX, startY, maxHeight, grid) {
  // Go to the end of the chart and try to find a free spot.
  for (let i = startY; i < maxHeight - RADIUS; i++) {
    if (annotionOverlaps(grid, startX, i) !== true) {
      return i;
    }
  }

  // If no space is found from the startX to the end of the chart, look from
  // the startX to the beginning of the chart.
  for (let i = startY; i > RADIUS; i--) {
    if (annotionOverlaps(grid, startX, i) !== true) {
      return i;
    }
  }

  return startY;
}

function removeDoubleAxisCoordinates(annotationLines, cssModifier) {
  annotationLines.forEach((annotationLine) => {
    if (annotationLine.coordinates.length > 1) {
      let coordMap;
      if (
        annotationLine.position === "top" ||
        (cssModifier === "narrow" && annotationLine.position === "left")
      ) {
        // get unique x-axis coordinates, with the lowest y axis
        coordMap = new Map(
          annotationLine.coordinates
            .sort((coordA, coordB) => coordA.featureY - coordB.featureY)
            .map((coord) => [coord.featureX, coord])
        ).values();
      } else if (
        annotationLine.position === "bottom" ||
        (cssModifier === "narrow" && annotationLine.position === "right")
      ) {
        // get unique x-axis coordinates, with the highest y axis
        coordMap = new Map(
          annotationLine.coordinates
            .sort((coordA, coordB) => coordB.featureY - coordA.featureY)
            .map((coord) => [coord.featureX, coord])
        ).values();
      } else if (annotationLine.position === "left") {
        // get unique y-axis coordinates, with the lowest x axis
        coordMap = new Map(
          annotationLine.coordinates
            .sort((coordA, coordB) => coordA.featureX - coordB.featureX)
            .map((coord) => [coord.featureY, coord])
        ).values();
      } else if (annotationLine.position === "right") {
        // get unique y-axis coordinates, with the highest x axis
        coordMap = new Map(
          annotationLine.coordinates
            .sort((coordA, coordB) => coordB.featureX - coordA.featureX)
            .map((coord) => [coord.featureY, coord])
        ).values();
      }

      // sort by coordinates depending on where they're displayed, to display the first one on the left (y) or top (x)
      annotationLine.coordinates = Array.from(coordMap).sort(
        (coordA, coordB) => {
          if (
            annotationLine.position === "top" ||
            annotationLine.position === "bottom" ||
            cssModifier === "narrow"
          ) {
            return coordA.featureX - coordB.featureX;
          } else {
            return coordA.featureY - coordB.featureY;
          }
        }
      );
    }
  });
  return annotationLines;
}

/**
 * Loops over all the regions and clusters them into
 * groups of regions that are neighbours of each-other.
 *
 * @param {Array<GeoJSON.Feature>} regions
 * @returns {Array<Array<GeoJSON.Feature>>}
 */
function clusterNeighbouringRegions(regions) {
  // Once a region is picked we exclude it from further processing.
  const excludeList = {};
  const clusters = [];

  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];

    // Do not process previously traversed regions.
    if (excludeList[region.properties.id] !== true) {
      // Recursive function.
      const cluster = findAllNeighbours([region], regions, excludeList);
      clusters.push(cluster);
    }
  }

  return clusters;
}

/**
 * Recursively find all neighbours expanding as we find each neighbour.
 * Excludes previously visited regions.
 *
 * @param {Array<GeoJSON.Feature} startRegions
 * @param {Array<GeoJSON.Feature>} regions
 * @param {Record<string, boolean>} exclude Map of regions to exclude. key = id.
 * @returns {Array<Array<GeoJSON.Feature>>}
 */
function findAllNeighbours(startRegions, regions, exclude = {}) {
  let neighbours = [];

  for (let i = 0; i < startRegions.length; i++) {
    const startRegion = startRegions[i];

    exclude[startRegion.properties.id] = true;

    // Iterate over the regions and check if it neighbours the startRegions.
    regions.forEach(potentialNeighbourRegion => {
        if (exclude[potentialNeighbourRegion.properties.id] !== true) {
            const overlaps = booleanOverlap(startRegion, potentialNeighbourRegion);

            if (overlaps) {
                neighbours.push(potentialNeighbourRegion);
                exclude[potentialNeighbourRegion.properties.id] = true;
            }
        }
    });

    // If we have neighbours, recurse.
    if (neighbours.length > 0) {
        neighbours = [...findAllNeighbours(neighbours, regions, exclude)];
    }
  }

  return [...startRegions, ...neighbours];
}

function annotionOverlaps(grid, x, y) {
  const x1 = x - RADIUS;
  const x2 = x + RADIUS;
  const y1 = y - RADIUS;
  const y2 = y + RADIUS;

  for (let i = 0; i < grid.length; i++) {
    const gridItem = grid[i];

    // We expand the existing grid item so the annotations have a margin between them.
    const gridItemX1 = gridItem.x - RADIUS - MARGINS_BETWEEN_ANNOTATIONS;
    const gridItemX2 = gridItem.x + RADIUS + MARGINS_BETWEEN_ANNOTATIONS;
    const gridItemY1 = gridItem.y - RADIUS - MARGINS_BETWEEN_ANNOTATIONS;
    const gridItemY2 = gridItem.y + RADIUS + MARGINS_BETWEEN_ANNOTATIONS;

    const isTopLeftOverlapping = isCoordinateBetween(x1, gridItemX1, gridItemX2) && isCoordinateBetween(y1, gridItemY1, gridItemY2);
    const isBottomRightOverlapping = isCoordinateBetween(x2, gridItemX1, gridItemX2) && isCoordinateBetween(y2, gridItemY1, gridItemY2);

    if (isTopLeftOverlapping || isBottomRightOverlapping) {
      return true;
    }
  }

  return false;
}

/**
 * @param {Number} coordinate
 * @param {Number} start
 * @param {Number} end
 * @returns {Boolean}
 */
function isCoordinateBetween(coordinate, start, end) {
  return (coordinate >= start && coordinate <= end) ? true : false;
}