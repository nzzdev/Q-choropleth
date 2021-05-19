import { round } from "../helpers/data.js";
import { getCssModifier } from "../helpers/cssModifier.js";
import {
  hasAnnotationOnTopOrBottom,
  hasAnnotationOnLeftOrRight,
} from "../helpers/annotations.js";

export function getAspectRatioViewBox(
  xMin,
  yMin,
  width,
  height,
  contentWidth,
  annotations,
  annotationSpace
) {
  let cssModifier = getCssModifier(contentWidth);

  if (annotations.length > 0) {
    if (hasAnnotationOnTopOrBottom(annotations, cssModifier)) {
      yMin += -(annotationSpace / 2);
      height += annotationSpace;
    }
    if (hasAnnotationOnLeftOrRight(annotations, cssModifier)) {
      xMin += -(annotationSpace / 2);
      width += annotationSpace;
    }
  }

  const viewBox = [xMin, yMin, width, height]
    .map((value) => round(value))
    .join(" ");
  const aspectRatio = contentWidth / height;

  return { aspectRatio, viewBox };
}
