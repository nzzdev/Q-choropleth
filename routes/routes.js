module.exports = [
  require("./rendering-info/web.js"),
  require("./stylesheet.js"),
  require("./script.js"),
  require("./health.js"),
  require("./fixtures/data.js"),
  require("./locales.js"),
  require("./option-availability.js"),
  require("./notifications/hasValues.js"),
  require("./notifications/predefinedContent.js"),
  require("./notifications/customBuckets.js"),
  require("./notifications/numberBucketsExceedsDataSet.js"),
  require("./notifications/unsupportedValuesForType.js"),
  require("./notifications/moreThanTwoColumns.js"),
  require("./notifications/numberBucketsOutOfColorScale.js"),
  require("./notifications/numberCategoriesOutOfColorScale.js"),
  require("./dynamic-schema.js"),
  require("./entityCollection.js"),
].concat(require("./schema.js"));
