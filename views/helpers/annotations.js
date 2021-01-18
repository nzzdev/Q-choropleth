const extent = require("../helpers/extent.js");

/**
 * Returns true, if the region (Kanton, Landkreis, etc.) has at least one annotation.
 */
function regionHasAnnotation(annotations, region) {
  return annotations.some(a => a.regions[0] === region);
}

/**
 * Links the annotations to the hexagons and sets all the coordinates needed for drawing the annotations correctly
 */
function setCoordinatesForHexMap(annotations, hexagons, annotationStartPosition, cssModifier) {
  const [xMin, xMax] = extent.getExtents(hexagons, ({ x }) => x);
  const [yMin, yMax] = extent.getExtents(hexagons, ({ y }) => y);
  const lineStartPosition = annotationStartPosition / 2;
  
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
 * ...
 */
function setCoordinatesForGeoMap(annotations, cssModifier) {
  annotations.forEach(a => {

  });
  return annotations;
}

/**
 * Helper functions for setCoordinatesForHexMap()
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
  regionHasAnnotation,
  setCoordinatesForHexMap,
  setCoordinatesForGeoMap
};
