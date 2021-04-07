const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://gisco-services.ec.europa.eu/distribution/v2/nuts/download/ref-nuts-2021-01m.geojson.zip",
  featuresPath: "./NUTS_RG_01M_2021_4326_LEVL_0.geojson",
  featuresPropertyMapping: {
    name: "NAME_LATN",
    nuts: "NUTS_ID",
  },
  rewriteProperties: {
    BE: "Belgien",
    BG: "Bulgarien",
    DK: "Dänemark",
    DE: "Deutschland",
    EE: "Estland",
    FI: "Finnland",
    FR: "Frankreich",
    EL: "Griechenland",
    IE: "Irland",
    IT: "Italien",
    HR: "Kroatien",
    LV: "Lettland",
    LT: "Litauen",
    LU: "Luxemburg",
    MT: "Malta",
    NL: "Niederlande",
    AT: "Österreich",
    PL: "Polen",
    PT: "Portugal",
    RO: "Rumänien",
    SE: "Schweden",
    SI: "Slowenien",
    SK: "Slowakei",
    ES: "Spanien",
    CZ: "Tschechien",
    HU: "Ungarn",
    UK: "Grossbritanien",
    CY: "Zypern",
    IS: "Island",
    LI: "Liechtenstein",
    NO: "Norwegen",
    CH: "Schweiz",
    AL: "Albanien",
    ME: "Montenegro",
    MK: "Nordmazedonien",
    RS: "Serbien",
    TR: "Türkei",
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
      "-simplify 20%"
    );
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.convertToTopojson(outputFeaturesPath, "features");
  },
};
