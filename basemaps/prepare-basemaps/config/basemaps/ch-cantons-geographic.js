const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/15784603/master",
  featuresPath:
    "./2021_GEOM_TK/GEOM_2021/01_INST/Gesamtfl�che_gf/K4_kant19970101_gf/K4kant19970101gf_ch2007Poly.shp",
  waterPath:
    "./2021_GEOM_TK/GEOM_2021/00_TOPO/K4_seenyyyymmdd/k4seenyyyymmdd11_ch2007Poly.shp",
  featuresPropertyMapping: {
    bfsNumber: "ID0",
    name: "ID1",
  },
  rewriteProperties: {
    1: "Zürich",
    2: "Bern",
    3: "Luzern",
    4: "Uri",
    5: "Schwyz",
    6: "Obwalden",
    7: "Nidwalden",
    8: "Glarus",
    9: "Zug",
    10: "Freiburg",
    11: "Solothurn",
    12: "Basel-Stadt",
    13: "Basel-Landschaft",
    14: "Schaffhausen",
    15: "Appenzell Ausserhoden",
    16: "Appenzell Innerhoden",
    17: "St. Gallen",
    18: "Graubünden",
    19: "Aargau",
    20: "Thurgau",
    21: "Tessin",
    22: "Waadt",
    23: "Wallis",
    24: "Neuenburg",
    25: "Genf",
    26: "Jura",
  },
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
    helpers.convertToGeojson(inputFeaturesPath, outputFeaturesPath, "");
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.convertToTopojson(outputFeaturesPath, "features");

    // generate water topojson file
    const inputWaterPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${config.waterPath}`;
    const outputWaterPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/water.json`;
    helpers.convertToGeojson(inputWaterPath, outputWaterPath, "-drop fields=*");
    helpers.convertToTopojson(outputWaterPath, "water");

    // merge features and water into single topojson file
    const outputPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
    helpers.mergeTopojsons(outputFeaturesPath, outputWaterPath, outputPath);
  },
};
