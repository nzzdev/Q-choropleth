const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://www2.census.gov/geo/tiger/GENZ2019/shp/cb_2019_us_state_20m.zip",
  featuresPath: "./cb_2019_us_state_20m.shp",
  featuresPropertyMapping: {
    name: "NAME",
    isoCode: "STUSPS",
  },
  rewriteProperties: {},
};

module.exports = {
  download: async function (basemap, version) {
    const response = await fetch(config.dataUrl);
    if (response.ok) {
      response.body.pipe(
        unzipper.Extract({
          path: `${__dirname}/../../00-download-basemaps/data/${basemap.id}-${version.validFrom}`,
        })
      );
    }
  },
  transform: async function (helpers, basemap, version) {
    // generate features topojson file
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}-${version.validFrom}/${config.featuresPath}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}-${version.validFrom}/${basemap.id}-${version.validFrom}.json`;
    helpers.convertToGeojson(inputFeaturesPath, outputFeaturesPath, "");
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.convertToTopojson(outputFeaturesPath, "features");
  },
};
