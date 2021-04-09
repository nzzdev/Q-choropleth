const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://gisco-services.ec.europa.eu/distribution/v2/nuts/download/ref-nuts-2021-10m.geojson.zip",
  featuresPath: "./NUTS_RG_10M_2021_4326_LEVL_1.geojson",
  featuresPropertyMapping: {
    name: "NAME_LATN",
    nuts: "NUTS_ID",
  },
  rewriteProperties: {},
  bbox: "-5.66,41.0,10.8,51.51",
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
      `-filter 'CNTR_CODE === "FR"' -clip bbox=${config.bbox}`
    );
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.convertToTopojson(outputFeaturesPath, "features");
  },
};
