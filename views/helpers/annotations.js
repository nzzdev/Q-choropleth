const extent = require("../helpers/extent.js");

/**
 * Returns true, if there is at least one annotation on the left or on the right.
 */
function hasAnnotationOnLeftOrRight(annotations) {
  return annotations.some(a => a.position === "left" || a.position === "right");
}

/**
 * Returns true, if there is at least one annotation on the top or on the bottom.
 */
function hasAnnotationOnTopOrBottom(annotations) {
  return annotations.some(a => a.position === "top" || a.position === "bottom");
}

/**
 * Returns true, if the region (Kanton, Landkreis, etc.) has at least one annotation.
 */
function regionHasAnnotation(annotations, region) {
  return annotations.some(a => a.regions[0] === region);
}

/**
 * Links the annotations to the hexagons and sets all the coordinates needed for drawing the annotations correctly
 */
function setCoordinatesForHexMap(annotations, hexagons, annotationStartPosition, lineStartPosition, cssModifier) {
  const [xMin, xMax] = extent.getExtents(hexagons, ({ x }) => x);
  const [yMin, yMax] = extent.getExtents(hexagons, ({ y }) => y);

  annotations.forEach(a => {
    let hexagon = hexagons.find(h => h.text[0] === a.regions[0]);

    if(hexagon) {
      let horizontalIncrement = hexagon.width/4;
      let verticalIncrement = hexagon.height/4;

      if (a.position === "top" || a.position === "left") {
        // If contentWidth (cssModifier) is narrow, all annotations on the left will be drawn on the top
        a.coordinates = getTopCoordinates(hexagon.x, hexagon.y, yMin, horizontalIncrement, verticalIncrement, annotationStartPosition, lineStartPosition);
        
        if (cssModifier !== "narrow" && a.position === "left") {
          a.coordinates = getLeftCoordinates(hexagon.x, hexagon.y, xMin, verticalIncrement, annotationStartPosition, lineStartPosition);
        }
      } else {
        // If contentWidth (cssModifier) is narrow, all annotations on the right will be drawn on the bottom
        a.coordinates = getBottomCoordinates(hexagon.x, hexagon.y, yMax, hexagon.height, horizontalIncrement, verticalIncrement, annotationStartPosition, lineStartPosition);
        
        if (cssModifier !== "narrow" && a.position === "right") {
          a.coordinates = getRightCoordinates(hexagon.x, hexagon.y, xMax, hexagon.width, verticalIncrement, annotationStartPosition, lineStartPosition);
        }
      }
    }
  });
  return annotations;
}

/**
 * Links the annotations to the features of the geo map and sets all the coordinates needed for drawing the annotations correctly
 */
function setCoordinatesForGeoMap(annotations, geoParameters, entityType, annotationStartPosition, lineStartPosition, cssModifier) {
  let path = geoParameters.path;
  let features = geoParameters.features.features;
  let yMax = geoParameters.bounds[1][1];
  let xMax = geoParameters.bounds[1][0];

  annotations.forEach(a => {
    let feature = features.find(f => f.properties[entityType] === a.regions[0]);

    if (feature) {
      let centroid = path.centroid(feature);

      if (a.position === "top" || a.position === "left") {
        // If contentWidth (cssModifier) is narrow, all annotations on the left will be drawn on the top
        a.coordinates = getTopCoordinates(centroid[0], centroid[1], 0, 0, 0, annotationStartPosition, lineStartPosition);
        
        if (cssModifier !== "narrow" && a.position === "left") {
          a.coordinates = getLeftCoordinates(centroid[0], centroid[1], 0, 0, annotationStartPosition, lineStartPosition);
        }
      } else {
        // If contentWidth (cssModifier) is narrow, all annotations on the right will be drawn on the bottom
        a.coordinates = getBottomCoordinates(centroid[0], centroid[1], yMax, 0, 0, 0, annotationStartPosition, lineStartPosition);
        
        if (cssModifier !== "narrow" && a.position === "right") {
          a.coordinates = getRightCoordinates(centroid[0], centroid[1], xMax, 0, 0, annotationStartPosition, lineStartPosition);
        }
      }
    }
  });
  return annotations;
}

/**
 * Helper functions for setCoordinatesForHexMap() and setCoordinatesForGeoMap()
 */
function getTopCoordinates(x, y, yMin, horizontalIncrement, verticalIncrement, annotationStartPosition, lineStartPosition) {
  return {
    x: x + horizontalIncrement,
    y: yMin - annotationStartPosition,
    lineX1: x + horizontalIncrement,
    lineY1: yMin - lineStartPosition,
    lineX2: x + horizontalIncrement,
    lineY2: y + (verticalIncrement / 2)
  }
}

function getLeftCoordinates(x, y, xMin, verticalIncrement, annotationStartPosition, lineStartPosition) {
  return {
    x: xMin - annotationStartPosition,
    y: y + verticalIncrement,
    lineX1: xMin - lineStartPosition,
    lineY1: y + verticalIncrement,
    lineX2: x,
    lineY2: y + verticalIncrement
  }
}

function getBottomCoordinates(x, y, yMax, hexHeight, horizontalIncrement, verticalIncrement, annotationStartPosition, lineStartPosition) {
  return {
    x: x + (horizontalIncrement * 3), // show on right side of hex
    y: yMax + hexHeight + annotationStartPosition,
    lineX1: x + (horizontalIncrement * 3),
    lineY1: yMax + hexHeight + lineStartPosition,
    lineX2: x + (horizontalIncrement * 3),
    lineY2: y + hexHeight - (verticalIncrement / 2)
  }
}

function getRightCoordinates(x, y, xMax, hexWidth, verticalIncrement, annotationStartPosition, lineStartPosition) {
  return {
    x: xMax + hexWidth + annotationStartPosition,
    y: y + verticalIncrement,
    lineX1: x + hexWidth,
    lineY1: y + verticalIncrement,
    lineX2: xMax + hexWidth + lineStartPosition,
    lineY2: y + verticalIncrement
  }
}

module.exports = {
  hasAnnotationOnLeftOrRight,
  hasAnnotationOnTopOrBottom,
  regionHasAnnotation,
  setCoordinatesForHexMap,
  setCoordinatesForGeoMap
};
