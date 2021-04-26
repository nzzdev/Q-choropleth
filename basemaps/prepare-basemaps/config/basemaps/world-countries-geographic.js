const fs = require("fs");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://nzz-q-assets.s3.eu-west-1.amazonaws.com/2021/04/26/AL_Global_Choropleth-cfad9024f2009bcef548f6d2ff5c824c.json",
  featuresPath: "features.json",
  featuresPropertyMapping: {
    name: "ADMIN",
    isoAlpha3: "ADM0_A3",
  },
  rewriteProperties: {},
};

module.exports = {
  download: async function (basemap, version) {
    const response = await fetch(config.dataUrl);
    if (response.ok) {
      const directory = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/`;
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      fs.writeFileSync(
        `${directory}${config.featuresPath}`,
        await response.buffer()
      );
    }
  },
  transform: async function (helpers, basemap, version) {
    // generate features topojson file
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${config.featuresPath}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
    helpers.convertToGeojson(inputFeaturesPath, outputFeaturesPath, "");
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.convertToTopojson(outputFeaturesPath, "features");
  },
};
