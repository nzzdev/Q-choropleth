import { round } from "../helpers/data.js";

export function getAspectRatioViewBox(
  xMin,
  yMin,
  width,
  height,
  contentWidth,
  annotations,
  annotationSpace
) {
  if (annotations.length > 0) {
    // always add space on top and bottom of the map for annotations
    yMin += -(annotationSpace * 1.5);
    height += (annotationSpace * 3) + 2;
  }

  const viewBox = [xMin, yMin, width, height]
    .map((value) => round(value));
  const aspectRatio = contentWidth / height;

  return { aspectRatio, viewBox };
}
