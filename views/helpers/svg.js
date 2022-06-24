import { round } from "../helpers/data.js";
import { getCssModifier } from "../helpers/cssModifier.js";
import { hasAnnotationOnTopOrBottom } from "../helpers/annotations.js";

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
      yMin += -(annotationSpace * 1.5);
      height += (annotationSpace * 3) + 2;
    }
  }

  const viewBox = [xMin, yMin, width, height]
    .map((value) => round(value));
  const aspectRatio = contentWidth / height;

  return { aspectRatio, viewBox };
}
