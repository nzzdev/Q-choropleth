const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/15784603/master",
  featuresPath:
    "./2021_GEOM_TK/GEOM_2021/01_INST/Gesamtfl�che_gf/K4_polg20210101_gf/K4polg20210101gf_ch2007Poly.shp",
  waterPath:
    "./2021_GEOM_TK/GEOM_2021/00_TOPO/K4_seenyyyymmdd/k4seenyyyymmdd11_ch2007Poly.shp",
  featuresPropertyMapping: {
    id: "id",
    name: "name",
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
    helpers.convertToGeojson(inputWaterPath, outputWaterPath, "-drop fields=*");
    helpers.convertToTopojson(outputWaterPath, "water");

    // merge features and water into single topojson file
    const outputPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}-${version.validFrom}/${basemap.id}-${version.validFrom}.json`;
    helpers.mergeTopojsons(outputFeaturesPath, outputWaterPath, outputPath);
  },
};
