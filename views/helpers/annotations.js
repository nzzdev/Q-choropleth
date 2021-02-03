const extent = require("../helpers/extent.js");

/**
 * Returns true, if there is at least one annotation on the left or on the right.
 */
function hasAnnotationOnLeftOrRight(annotations, cssModifier) {
  if (cssModifier === "narrow") return false; // on mobile...
  return annotations.some(a => a.position === "left" || a.position === "right");
}

/**
 * Returns true, if there is at least one annotation on the top or on the bottom.
 */
function hasAnnotationOnTopOrBottom(annotations, cssModifier) {
  if (cssModifier === "narrow" && annotations.length > 0) return true; // on mobile...
  return annotations.some(a => a.position === "top" || a.position === "bottom");
}

/**
 * Returns true, if the region (Kanton, Landkreis, etc.) has at least one annotation.
 */
function regionHasAnnotation(annotations, region) {
  return annotations.some(a => a.region === region);
}

/**
 * Links the annotations to the hexagons and sets all the coordinates needed for drawing the annotations correctly
 */
function setCoordinatesForHexMap(annotations, hexagons, annotationStartPosition, cssModifier) {
  const [xMin, xMax] = extent.getExtents(hexagons, ({ x }) => x);
  const [yMin, yMax] = extent.getExtents(hexagons, ({ y }) => y);

  annotations.forEach(a => {
    let hexagon = hexagons.find(h => h.text[0] === a.region);

    if(hexagon) {
      let horizontalIncrement = hexagon.width/4;
      let verticalIncrement = hexagon.height/4;

      if (a.position === "top" || a.position === "left") {
        // If contentWidth (cssModifier) is narrow, all annotations on the left will be drawn on the top
        a.coordinates = getTopCoordinates(hexagon.x, hexagon.y, yMin, horizontalIncrement, verticalIncrement, annotationStartPosition);
        
        if (cssModifier !== "narrow" && a.position === "left") {
          a.coordinates = getLeftCoordinates(hexagon.x, hexagon.y, xMin, verticalIncrement, annotationStartPosition);
        }
      } else {
        // If contentWidth (cssModifier) is narrow, all annotations on the right will be drawn on the bottom
        a.coordinates = getBottomCoordinates(hexagon.x, hexagon.y, yMax, hexagon.height, horizontalIncrement, verticalIncrement, annotationStartPosition);
        
        if (cssModifier !== "narrow" && a.position === "right") {
          a.coordinates = getRightCoordinates(hexagon.x, hexagon.y, xMax, hexagon.width, verticalIncrement, annotationStartPosition);
        }
      }
    }
  });
  return annotations;
}

/**
 * Links the annotations to the features of the geo map and sets all the coordinates needed for drawing the annotations correctly
 */
function setCoordinatesForGeoMap(annotations, geoParameters, entityType, annotationStartPosition, cssModifier) {
  let path = geoParameters.path;
  let features = geoParameters.features.features;
  let yMax = geoParameters.bounds[1][1];
  let xMax = geoParameters.bounds[1][0];

  annotations.forEach(a => {
    let feature = features.find(f => f.properties[entityType] === a.region);

    if (feature) {
      let centroid = path.centroid(feature);

      if (a.position === "top" || a.position === "left") {
        // If contentWidth (cssModifier) is narrow, all annotations on the left will be drawn on the top
        a.coordinates = getTopCoordinates(centroid[0], centroid[1], 0, 0, 0, annotationStartPosition);
        
        if (cssModifier !== "narrow" && a.position === "left") {
          a.coordinates = getLeftCoordinates(centroid[0], centroid[1], 0, 0, annotationStartPosition);
        }
      } else {
        // If contentWidth (cssModifier) is narrow, all annotations on the right will be drawn on the bottom
        a.coordinates = getBottomCoordinates(centroid[0], centroid[1], yMax, 0, 0, 0, annotationStartPosition);
        
        if (cssModifier !== "narrow" && a.position === "right") {
          a.coordinates = getRightCoordinates(centroid[0], centroid[1], xMax, 0, 0, annotationStartPosition);
        }
      }
    }
  });
  return annotations;
}

/**
 * Helper function for setCoordinatesForHexMap() and setCoordinatesForGeoMap()
 */
function getTopCoordinates(x, y, yMin, horizontalIncrement, verticalIncrement, annotationStartPosition) {
  return {
    x: x + horizontalIncrement,
    y: yMin - annotationStartPosition,
    lineX1: x + horizontalIncrement,
    lineY1: yMin - annotationStartPosition,
    lineX2: x + horizontalIncrement,
    lineY2: y + (verticalIncrement / 2)
  }
}

/**
 * Helper function for setCoordinatesForHexMap() and setCoordinatesForGeoMap()
 */
function getLeftCoordinates(x, y, xMin, verticalIncrement, annotationStartPosition) {
  return {
    x: xMin - annotationStartPosition,
    y: y + verticalIncrement,
    lineX1: xMin - annotationStartPosition,
    lineY1: y + verticalIncrement,
    lineX2: x,
    lineY2: y + verticalIncrement
  }
}

/**
 * Helper function for setCoordinatesForHexMap() and setCoordinatesForGeoMap()
 */
function getBottomCoordinates(x, y, yMax, hexHeight, horizontalIncrement, verticalIncrement, annotationStartPosition) {
  return {
    x: x + (horizontalIncrement * 3), // show on right side of hex
    y: yMax + hexHeight + annotationStartPosition,
    lineX1: x + (horizontalIncrement * 3),
    lineY1: yMax + hexHeight + annotationStartPosition,
    lineX2: x + (horizontalIncrement * 3),
    lineY2: y + hexHeight - (verticalIncrement / 2)
  }
}

/**
 * Helper function for setCoordinatesForHexMap() and setCoordinatesForGeoMap()
 */
function getRightCoordinates(x, y, xMax, hexWidth, verticalIncrement, annotationStartPosition) {
  return {
    x: xMax + hexWidth + annotationStartPosition,
    y: y + verticalIncrement,
    lineX1: x + hexWidth,
    lineY1: y + verticalIncrement,
    lineX2: xMax + hexWidth + annotationStartPosition,
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
