import { getExtents } from "../helpers/extent.js";

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
  if (!geoParameters) return [];
  let path = geoParameters.path;
  let features = geoParameters.features.features;
  let yMax = geoParameters.bounds[1][1];
  let xMax = geoParameters.bounds[1][0];
  let annotationLines = [];

  annotations.forEach((annotation) => {
    let annotationLine = {
      id: annotation.id,
      position: annotation.position,
      coordinates: [],
    };

    annotation.regions.forEach((region) => {
      let feature = features.find(
        (f) => f.properties[entityType] === region.id
      );

      if (feature) {
        let centroid = feature.centroidOverride ? feature.centroidOverride : path.centroid(feature);
        let coordinates;

        if (annotation.position === "top" || annotation.position === "left") {
          // If contentWidth (cssModifier) is narrow, all annotations on the left will be drawn on the top
          coordinates = getTopCoordinates(
            centroid[0],
            centroid[1],
            0,
            0,
            0,
            annotationStartPosition
          );

          if (cssModifier !== "narrow" && annotation.position === "left") {
            coordinates = getLeftCoordinates(
              centroid[0],
              centroid[1],
              0,
              0,
              annotationStartPosition
            );
          }
        } else {
          // If contentWidth (cssModifier) is narrow, all annotations on the right will be drawn on the bottom
          coordinates = getBottomCoordinates(
            centroid[0],
            centroid[1],
            yMax,
            0,
            0,
            0,
            annotationStartPosition
          );

          if (cssModifier !== "narrow" && annotation.position === "right") {
            coordinates = getRightCoordinates(
              centroid[0],
              centroid[1],
              xMax,
              0,
              0,
              annotationStartPosition
            );
          }
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
  x,
  y,
  yMin,
  horizontalIncrement,
  verticalIncrement,
  annotationStartPosition
) {
  return {
    x: x + horizontalIncrement,
    y: yMin - annotationStartPosition,
    lineX1: x + horizontalIncrement,
    lineY1: yMin - annotationStartPosition / 2,
    lineX2: x + horizontalIncrement,
    lineY2: y + verticalIncrement / 2,
    featureX: x,
    featureY: y,
  };
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

function getBottomCoordinates(
  x,
  y,
  yMax,
  hexHeight,
  horizontalIncrement,
  verticalIncrement,
  annotationStartPosition
) {
  return {
    x: x + horizontalIncrement * 3, // show on right side of hex
    y: yMax + hexHeight + annotationStartPosition,
    lineX1: x + horizontalIncrement * 3,
    lineY1: yMax + hexHeight + annotationStartPosition / 2,
    lineX2: x + horizontalIncrement * 3,
    lineY2: y + hexHeight - verticalIncrement / 2,
    featureX: x,
    featureY: y,
  };
}

function getRightCoordinates(
  x,
  y,
  xMax,
  hexWidth,
  verticalIncrement,
  annotationStartPosition
) {
  return {
    x: xMax + hexWidth + annotationStartPosition,
    y: y + verticalIncrement,
    lineX1: x + hexWidth,
    lineY1: y + verticalIncrement,
    lineX2: xMax + hexWidth + annotationStartPosition / 2,
    lineY2: y + verticalIncrement,
    featureX: x,
    featureY: y,
  };
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
