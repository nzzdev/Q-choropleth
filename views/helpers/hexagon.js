/**
 * For a pointy topped hexagon, get the height for a given width.
 */
function heightFromWidth(width) {
  // Formula from https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  return 2 * sizeFromWidth(width);
}

/**
 * For a pointy topped hexagon, get the size (distance from center to corner) for a given width.
 */
function sizeFromWidth(width) {
  // Formula from https://www.redblobgames.com/grids/hexagons/#size-and-spacing
  return width / Math.sqrt(3);
}

/**
 * For a pointy topped hexagon, get all corner coordinates given center and size.
 */
function pointyHexCorners(center, size) {
  return Array.from({ length: 6 }, (_, i) => pointyHexCorner(center, size, i));
}

/**
 * For a pointy topped hexagon, get coordinates of one corner.
 */
function pointyHexCorner(center, size, i) {
  // Formulas from https://www.redblobgames.com/grids/hexagons/#angles
  const angleDegrees = 60 * i - 30;
  const angleRadians = (Math.PI / 180) * angleDegrees;
  return {
    x: center.x + size * Math.cos(angleRadians),
    y: center.y + size * Math.sin(angleRadians),
  };
}

function pointyHexToPixel({ q, r }, size) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

module.exports = {
  heightFromWidth,
  sizeFromWidth,
  pointyHexCorners,
  pointyHexCorner,
  pointyHexToPixel,
};
