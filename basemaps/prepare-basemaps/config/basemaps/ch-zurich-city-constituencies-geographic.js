const fs = require("fs");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://www.ogd.stadt-zuerich.ch/wfs/geoportal/Stimmkreise?service=WFS&version=1.1.0&request=GetFeature&outputFormat=GeoJSON&typename=adm_zaehlkreise_a",
  featuresPath: "features.json",
  featuresPropertyMapping: {
    id: "objid",
    name: "bezeichnung",
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
