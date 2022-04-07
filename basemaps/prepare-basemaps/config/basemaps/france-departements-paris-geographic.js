const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://gisco-services.ec.europa.eu/distribution/v2/nuts/download/ref-nuts-2021-10m.geojson.zip",
  featuresPath: "./NUTS_RG_10M_2021_4326_LEVL_3.geojson",
  featuresPropertyMapping: {
    id: "NUTS_ID",
    name: "NAME_LATN",
    nuts: "NUTS_ID",
  },
  rewriteProperties: {},
  addProperties: [
    {
      id: "FR101",
      DEP: "75",
    },
    {
      id: "FR105",
      DEP: "92",
    },
    {
      id: "FR106",
      DEP: "93",
    },
    {
      id: "FR107",
      DEP: "94",
    },
  ],
  bbox: "-5.66,41.0,10.8,51.51",
};

module.exports = {
  download: async function (basemap, version) {
    const response = await fetch(config.dataUrl);
    if (response.ok) {
      response.body.pipe(
        unzipper.Extract({
          path: `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}`,
        })
      );
    }
  },
  transform: async function (helpers, basemap, version) {
    // generate features topojson file
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${config.featuresPath}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;

    // get paris departements
    helpers.convertToGeojson(
      inputFeaturesPath,
      outputFeaturesPath,
      `-filter 'CNTR_CODE === "FR" && (FID==="FR101" || FID==="FR105" || FID==="FR106" || FID==="FR107")' -clip bbox=${config.bbox}`
    );

    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );

    helpers.addProperties(outputFeaturesPath, config.addProperties);
    helpers.convertToTopojson(outputFeaturesPath, "features");
  },
};
