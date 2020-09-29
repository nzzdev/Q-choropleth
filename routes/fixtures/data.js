const fixtureDataDirectory = "../../resources/fixtures/data";

// provide every fixture data file present in ../../resources/fixtures/data
// has to be in sync with files created in build task - see ../../tasks/build.js
const fixtureData = [
  require(`${fixtureDataDirectory}/hexagon-kmeans.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans-average-center.json`),
  require(`${fixtureDataDirectory}/hexagon-kmeans-single-value-bucket.json`),
  require(`${fixtureDataDirectory}/hexagon-quantile.json`),
  require(`${fixtureDataDirectory}/hexagon-equal.json`),
  require(`${fixtureDataDirectory}/hexagon-custom.json`),
  require(`${fixtureDataDirectory}/hexagon-categorical-map.json`),
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
