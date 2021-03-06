const data = require("../helpers/data.js");
const cssModifierHelpers = require("../helpers/cssModifier.js");
const annotationsHelpers = require("../helpers/annotations.js");

function getAspectRatioViewBox(xMin, yMin, width, height, contentWidth, annotations, annotationSpace) {
  let cssModifier = cssModifierHelpers.getCssModifier(contentWidth);

  if (annotations.length > 0) {
    if (annotationsHelpers.hasAnnotationOnTopOrBottom(annotations, cssModifier)) {
      yMin   += -(annotationSpace/2);
      height += annotationSpace
    }
    if (annotationsHelpers.hasAnnotationOnLeftOrRight(annotations, cssModifier)) {
      xMin  += -(annotationSpace/2);
      width += annotationSpace;
    }
  }

  const viewBox = [xMin, yMin, width, height]
    .map(value => data.round(value))
    .join(" ");
  const aspectRatio = contentWidth / height;

  return { aspectRatio, viewBox };
}

module.exports = { getAspectRatioViewBox };
