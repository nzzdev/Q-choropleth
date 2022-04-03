function getExactPixelWidth(toolRuntimeConfig) {
  if (!toolRuntimeConfig.size || !Array.isArray(toolRuntimeConfig.size.width)) {
    return undefined;
  }
  for (let width of toolRuntimeConfig.size.width) {
    if (
      width &&
      width.value &&
      (!width.unit || width.unit === "px")
    ) {
      if (width.comparison === "=") return width.value;
      if (width.comparison === "<") return 0; // temporary solution
    }
  }
  return undefined;
}

module.exports = {
  getExactPixelWidth,
};
