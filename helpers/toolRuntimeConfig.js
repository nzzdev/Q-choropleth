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
      // temporary solution
      if (width.comparison === "=") return width.value;
      if (width.comparison === "<") return 0;
      if (width.comparison === ">") return width.value;
    }
  }
  return undefined;
}

module.exports = {
  getExactPixelWidth,
};
