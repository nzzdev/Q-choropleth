const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl: "https://www.web.statistik.zh.ch/data/KTZH_151_Gemeinden2019.zip",
  featuresPath:
    "./GEN_A4_GEMEINDEN_2019_epsg4326_json/GEN_A4_GEMEINDEN_2019_epsg4326.json",
  waterPath:
    "./GEN_A4_GEMEINDEN_2019_epsg4326_json/GEN_A4_GEMEINDEN_SEEN_2019_epsg4326.json",
  featuresPropertyMapping: {
    id: "BFS",
    name: "NAME",
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

    // generate water topojson file
    const inputWaterPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}-${version.validFrom}/${config.waterPath}`;
    const outputWaterPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}-${version.validFrom}/water.json`;
    helpers.convertToGeojson(
      inputWaterPath,
      outputWaterPath,
      "-filter 'ART_CODE === 3' -drop fields=*"
    );
    helpers.convertToTopojson(outputWaterPath, "water");

    // merge features and water into single topojson file
    const outputPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}-${version.validFrom}/${basemap.id}-${version.validFrom}.json`;
    helpers.mergeTopojsons(outputFeaturesPath, outputWaterPath, outputPath);
  },
};
