const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://data.geo.admin.ch/ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill/shp/2056/ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill.zip",
  featuresPath: "./swissBOUNDARIES3D_1_3_TLM_KANTONSGEBIET.shp",
  featuresPropertyMapping: {
    bfsNumber: "KANTONSNUM",
    name: "NAME",
  },
  rewriteProperties: {
    23: "Wallis",
    22: "Waadt",
    21: "Tessin",
    10: "Freiburg",
    24: "Neuenburg",
    25: "Genf",
  },
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
    helpers.convertToGeojson(
      inputFeaturesPath,
      outputFeaturesPath,
      "-dissolve fields=KANTONSNUM,NAME -simplify 20%"
    );
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.convertToTopojson(outputFeaturesPath, "features");
  },
};
