const fs = require("fs");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://www.ogd.stadt-zuerich.ch/wfs/geoportal/Stimmkreise?service=WFS&version=1.1.0&request=GetFeature&outputFormat=GeoJSON&typename=adm_zaehlkreise_a",
  featuresPath: "features.json",
  featuresPropertyMapping: { id: "bezeichnung" },
  rewriteProperties: {
    "1 und 2": 10261,
    3: 20261,
    "4 und 5": 30261,
    6: 40261,
    "7 und 8": 50261,
    9: 60261,
    10: 70261,
    11: 80261,
    12: 90261,
  },
  addProperties: [
    {
      id: 10261,
      key: "Kreis 1 + 2",
      name: "1 + 2",
      parentId: 261,
    },
    {
      id: 20261,
      key: "Kreis 3",
      name: "3",
      parentId: 261,
    },
    {
      id: 30261,
      key: "Kreis 4 + 5",
      name: "4 + 5",
      parentId: 261,
    },
    {
      id: 40261,
      key: "Kreis 6",
      name: "6",
      parentId: 261,
    },
    {
      id: 50261,
      key: "Kreis 7 + 8",
      name: "7 + 8",
      parentId: 261,
    },
    {
      id: 60261,
      key: "Kreis 9",
      name: "9",
      parentId: 261,
    },
    {
      id: 70261,
      key: "Kreis 10",
      name: "10",
      parentId: 261,
    },
    {
      id: 80261,
      key: "Kreis 11",
      name: "11",
      parentId: 261,
    },
    {
      id: 90261,
      key: "Kreis 12",
      name: "12",
      parentId: 261,
    },
  ],
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
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${config.featuresPath}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
    helpers.convertToGeojson(inputFeaturesPath, outputFeaturesPath, "");
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.addProperties(outputFeaturesPath, config.addProperties);
    helpers.convertToTopojson(outputFeaturesPath, "features");
  },
};
