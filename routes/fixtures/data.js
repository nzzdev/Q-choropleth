const fixtureDataDirectory = "../../resources/fixtures/data";

// provide every fixture data file present in ../../resources/fixtures/data
// has to be in sync with files created in build task - see ../../tasks/build.js
const fixtureData = [
  require(`${fixtureDataDirectory}/geographic-numeric-map-europe.json`),
  require(`${fixtureDataDirectory}/geographic-categorical-show-bubble-map.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-hide-bubble-map.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-show-bubble-map.json`),
  require(`${fixtureDataDirectory}/geographic-categorical-map-with-null.json`),
  require(`${fixtureDataDirectory}/geographic-categorical-map.json`),
  require(`${fixtureDataDirectory}/geographic-categorical-show-annotations.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-map-custom-bucket-colors.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-map-with-null.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-map.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-show-annotations.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-show-multiple-annotations.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map-legend-custom-order.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map-legend-default-order.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map-with-empty.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map-with-null.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-show-annotations.json`),
  require(`${fixtureDataDirectory}/hexagon-convert.json`),
  require(`${fixtureDataDirectory}/hexagon-custom.json`),
  require(`${fixtureDataDirectory}/hexagon-equal.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans-average-center.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans-median-center.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans-single-value-bucket.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans.json`),
  require(`${fixtureDataDirectory}/hexagon-median.json`),
  require(`${fixtureDataDirectory}/hexagon-numeric-show-annotations.json`),
  require(`${fixtureDataDirectory}/hexagon-quantile.json`),
  require(`${fixtureDataDirectory}/hexagon-multiple-annotations.json`),
];

module.exports = {
  path: "/fixtures/data",
  method: "GET",
  options: {
    tags: ["api"],
  },
  handler: (request, h) => {
    return fixtureData;
  },
};
