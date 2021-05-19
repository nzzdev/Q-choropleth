/**
 * For a pointy topped hexagon, get the height for a given width.
 */
export function heightFromWidth(width) {
  // Formula from https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  return 2 * sizeFromWidth(width);
}

/**
 * For a pointy topped hexagon, get the width for a given height.
 */
export function widthFromHeight(height) {
  // Formula from https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  return Math.sqrt(3) * sizeFromHeight(height);
}

/**
 * For a pointy topped hexagon, get the size (distance from center to corner) for a given width.
 */
export function sizeFromWidth(width) {
  // Formula from https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  return width / Math.sqrt(3);
}

/**
 * For a pointy topped hexagon, get the size (distance from center to corner) for a given height.
 */
export function sizeFromHeight(height) {
  // Formula from https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  return height / 2;
}

/**
 * For a pointy topped hexagon, get all corner coordinates given center and size.
 */
export function pointyHexCorners(center, size) {
  return Array.from({ length: 6 }, (_, i) => pointyHexCorner(center, size, i));
}

/**
 * For a pointy topped hexagon, get coordinates of one corner.
 */
export function pointyHexCorner(center, size, i) {
  // Formulas from https://www.redblobgames.com/grids/hexagons/#angles
  const angleDegrees = 60 * i - 30;
  const angleRadians = (Math.PI / 180) * angleDegrees;
  return {
    x: center.x + size * Math.cos(angleRadians),
    y: center.y + size * Math.sin(angleRadians),
  };
}

export function pointyHexToPixel({ q, r }, size) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}
