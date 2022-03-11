import { getExtents } from "../helpers/extent.js";
import booleanOverlap from "@turf/boolean-overlap";
import { geoCentroid as d3centroid } from "d3-geo";

export const RADIUS = 8;

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
          coordinates = getTopCoordinates(
            hexagon.x,
            hexagon.y,
            yMin,
            horizontalIncrement,
            verticalIncrement,
            annotationStartPosition
          );
        } else if (
          annotation.position === "bottom" ||
          (cssModifier === "narrow" && annotation.position === "right")
        ) {
          coordinates = getBottomCoordinates(
            hexagon.x,
            hexagon.y,
            yMax,
            hexagon.height,
            horizontalIncrement,
            verticalIncrement,
            annotationStartPosition
          );
        } else if (annotation.position === "left") {
          coordinates = getLeftCoordinates(
            hexagon.x,
            hexagon.y,
            xMin,
            verticalIncrement,
            annotationStartPosition
          );
        } else if (annotation.position === "right") {
          coordinates = getRightCoordinates(
            hexagon.x,
            hexagon.y,
            xMax,
            hexagon.width,
            verticalIncrement,
            annotationStartPosition
          );
        }
        annotationLine.coordinates.push(coordinates);
      }
    });
    annotationLines.push(annotationLine);
  });

  annotationLines = removeDoubleAxisCoordinates(annotationLines, cssModifier);
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
  let path = geoParameters.path;
  let features = geoParameters.features.features;
  let yMax = geoParameters.bounds[1][1];
  let xMax = geoParameters.bounds[1][0];
  let annotationLines = [];


  console.log("geoparams", geoParameters, entityType, annotationStartPosition);
  const grid = [];
  const gridMargin = 2; // In pixels.

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
      const clusterCenterPointCoordinates = d3centroid({
        "type": "FeatureCollection",
        "features": cluster
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

      const maxWidthChart = geoParameters.bounds[1][0];
      const maxHeightChart = geoParameters.bounds[1][1];

      if (annotation.position === "top" || annotation.position === "left") {
        // If contentWidth (cssModifier) is narrow, all annotations on the left will be drawn on the top
        coordinates = getTopCoordinates(maxWidthChart, grid, x, y, 0, 0, 0, annotationStartPosition);

        if (cssModifier !== "narrow" && annotation.position === "left") {
          coordinates = getLeftCoordinates(maxHeightChart, grid, x, y, 0, 0, annotationStartPosition);
        }
      } else {
        // If contentWidth (cssModifier) is narrow, all annotations on the right will be drawn on the bottom
        coordinates = getBottomCoordinates(maxWidthChart, grid, x, y, yMax, 0, 0, 0, annotationStartPosition);

        if (cssModifier !== "narrow" && annotation.position === "right") {
          coordinates = getRightCoordinates(maxHeightChart, grid, x, y, xMax, 0, 0, annotationStartPosition);
        }
      }

      annotationLine.coordinates.push(coordinates);
    });

    annotationLines.push(annotationLine);
  });

  annotationLines = removeDoubleAxisCoordinates(annotationLines, cssModifier);

  console.log("annotationLines", annotationLines);
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

function getTopCoordinates(
  maxWidthChart,
  grid,
  x,
  y,
  yMin,
  horizontalIncrement,
  verticalIncrement,
  annotationStartPosition
) {

  const startY = y;
  // Copy the coordinate so the line will be correctly drawn to the target region
  // even if the x moves because of overlaps.
  const lineX2 = x;

  y = yMin - annotationStartPosition;

  x = findNearestAvailableSpotHorizontally(grid, maxWidthChart, x, y);

  // Todo: comment.
  if (x === null) {
    x = lineX2;
  }

  x = x + horizontalIncrement;

  const obj = {
    x,
    y,
    lineX1: x,
    lineY1: yMin - annotationStartPosition / 2,
    lineX2: lineX2 + horizontalIncrement,
    lineY2: startY + verticalIncrement / 2,
    featureX: x,
    featureY: y,
  };

  grid.push({
    x,
    y
  });

  return obj;
}

function getLeftCoordinates(
  x,
  y,
  xMin,
  verticalIncrement,
  annotationStartPosition
) {
  return {
    x: xMin - annotationStartPosition,
    y: y + verticalIncrement,
    lineX1: xMin - annotationStartPosition / 2,
    lineY1: y + verticalIncrement,
    lineX2: x,
    lineY2: y + verticalIncrement,
    featureX: x,
    featureY: y,
  };
}

/**
 *
 * @param {*} grid
 * @param {*} x
 * @param {*} y
 * @param {*} yMax
 * @param {*} hexHeight
 * @param {*} horizontalIncrement
 * @param {*} verticalIncrement
 * @param {*} annotationStartPosition
 * @returns
 */
function getBottomCoordinates(
  maxWidthChart,
  grid,
  x,
  y,
  yMax,
  hexHeight,
  horizontalIncrement,
  verticalIncrement,
  annotationStartPosition
) {

  const startY = y;
  // Copy the coordinate so the line will be correctly drawn to the target region
  // even if the x moves because of overlaps.
  const lineX2 = x;

  y = yMax + hexHeight + annotationStartPosition;

  x = findNearestAvailableSpotHorizontally(grid, maxWidthChart, x, y);

  if (x === null) {
    x = lineX2;
  }



  x = x + horizontalIncrement * 3 // show on right side of hex


  const obj = {
    x,
    y,
    lineX1: x,
    lineY1: yMax + hexHeight + annotationStartPosition / 2,
    lineX2: lineX2 + horizontalIncrement * 3,
    lineY2: startY + hexHeight - verticalIncrement / 2,
    featureX: x,
    featureY: startY,
  };

  grid.push({x, y});
  return obj;
}

/**
 *
 * @param {Number} maxWidth Max width of chart.
 * @param {Number} startX StartX of point that is blocking us.
 * @param {Number} startY Start y of the point that is blocking us.
 * @returns {Number|null}
 */
function findNearestAvailableSpotHorizontally(grid, maxWidth, startX, startY) {
  // Go to the end of the chart and try to find a free spot.
  for (let i = startX; i < maxWidth - RADIUS; i++) {
    if (annotionOverlaps(grid, i, startY) !== true) {
      return i;
    }
  }

  // If no space is found from the startX to the end of the chart.
  // We will now start again but go the beginning of the chart looking for a free spot.
  for (let i = startX; i > RADIUS; i--) {
    if (annotionOverlaps(grid, i, startY) !== true) {
      return i;
    }
  }

  return null;
}

function findNearestAvailableSpotVertically(grid, maxHeight, startX, startY) {
  // Go to the end of the chart and try to find a free spot.
  // for (let i = startY; i < maxWidth - RADIUS; i++) {
  //   if (annotionOverlaps(grid, i, startY) !== true) {
  //     return i;
  //   }
  // }

  // // If no space is found from the startX to the end of the chart.
  // // We will now start again but go the beginning of the chart looking for a free spot.
  // for (let i = startX; i > RADIUS; i--) {
  //   if (annotionOverlaps(grid, i, startY) !== true) {
  //     return i;
  //   }
  // }

  return null;
}

function getRightCoordinates(
  maxHeightChart,
  grid,
  x,
  y,
  xMax,
  hexWidth,
  verticalIncrement,
  annotationStartPosition
) {

  // Copy the coordinate so the line will be correctly drawn to the target region
  // even if the x moves because of overlaps.
  const lineY1 = y;


  const obj = {
    x: xMax + hexWidth + annotationStartPosition,
    y: y + verticalIncrement,
    lineX1: x + hexWidth,
    lineY1: lineY1 + verticalIncrement,
    lineX2: xMax + hexWidth + annotationStartPosition / 2,
    lineY2: y + verticalIncrement,
    featureX: x,
    featureY: y,
  };

  grid.push({x, y});
  return obj;
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
  // Todo import radius.
  const radius = 8;

  const x1 = x - radius;
  const x2 = x + radius;
  const y1 = y - radius;
  const y2 = y + radius;

  for (let i = 0; i < grid.length; i++) {
    const gridItem = grid[i];

    const gridItemX1 = gridItem.x - radius;
    const gridItemX2 = gridItem.x + radius;
    const gridItemY1 = gridItem.y - radius;
    const gridItemY2 = gridItem.y + radius;


    // console.log("a",x1, x2, y1, y2);
    // console.log("b", gridItemX1, gridItemX2, gridItemY1, gridItemY2);

    if (
      (x1 >= gridItemX1 && x1 <= gridItemX2
      && y1 >= gridItemY1 && y1 <= gridItemY1) ||
      (x2 <= gridItemX2 && x2 >= gridItemX1 && y2 <= gridItemY2 && y2 >= gridItemY2)
    ) {
      return true;
    }
  }

  return false;
}
