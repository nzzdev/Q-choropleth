const fixtureDataDirectory = "../../resources/fixtures/data";

// provide every fixture data file present in ../../resources/fixtures/data
// has to be in sync with files created in build task - see ../../tasks/build.js
const fixtureData = [
  require(`${fixtureDataDirectory}/geographic-categorical-map-with-null.json`),
  require(`${fixtureDataDirectory}/geographic-categorical-map.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-map-custom-bucket-colors.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-map-with-null.json`),
  require(`${fixtureDataDirectory}/geographic-numeric-map.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans-average-center.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans-median-center.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans-single-value-bucket.json`),
  require(`${fixtureDataDirectory}/hexagon-quantile.json`),
  require(`${fixtureDataDirectory}/hexagon-equal.json`),
  require(`${fixtureDataDirectory}/hexagon-custom.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map-with-null.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map-with-empty.json`),
  require(`${fixtureDataDirectory}/hexagon-convert.json`),
  require(`${fixtureDataDirectory}/hexagon-median.json`),
];

module.exports = {
  path: "/fixtures/data",
  method: "GET",
  options: {
    tags: ["api"],
    cors: true,
  },
  handler: (request, h) => {
    return fixtureData;
  },
};
