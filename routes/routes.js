module.exports = [
  require("./rendering-info/web.js"),
  require("./basemap.js"),
  require("./stylesheet.js"),
  require("./script.js"),
  require("./health.js"),
  require("./fixtures/data.js"),
  require("./locales.js"),
  require("./option-availability.js"),
  require("./notifications/hasValues.js"),
  require("./notifications/predefinedContent.js"),
  require("./notifications/mapAnnotationsPosition.js"),
  require("./notifications/customBuckets.js"),
  require("./notifications/numberBucketsExceedsDataSet.js"),
  require("./notifications/unsupportedValuesForType.js"),
  require("./notifications/numberBucketsOutOfColorScale.js"),
  require("./notifications/numberCategoriesOutOfColorScale.js"),
  require("./dynamic-schema.js"),
].concat(require("./schema.js"));
