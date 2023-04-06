const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  "2023-01-01T00:00:00.000Z": {
    dataUrl: "https://dam-api.bfs.admin.ch/hub/api/dam/assets/24106754/master",
    featuresPath: "./ag-b-00.03-875-gg23/ggg_2023_LV95/shp/k4k23.shp",
    waterPath: "./ag-b-00.03-875-gg23/ggg_2023_LV95/shp/k4s23.shp",
    featuresPropertyMapping: {
      id: "KTNR",
      name: "KTNAME",
    },
    rewriteProperties: {
      "Bern / Berne": "Bern",
      "Fribourg / Freiburg": "Freiburg",
      "Graubünden / Grigioni / Grischun": "Graubünden",
      Ticino: "Tessin",
      Vaud: "Waadt",
      "Valais / Wallis": "Wallis",
      Neuchâtel: "Neuenburg",
      Genève: "Genf",
    },
  },
  "2021-01-01T00:00:00.000Z": {
    dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/16804410/master",
    featuresPath: "./ggg_2021-LV95/shp/k4k21.shp",
    waterPath: "./ggg_2021-LV95/shp/k4s21.shp",
    featuresPropertyMapping: {
      id: "KTNR",
      name: "KTNAME",
    },
  },
  rewriteProperties: {
    "Bern / Berne": "Bern",
    "Fribourg / Freiburg": "Freiburg",
    "Graubünden / Grigioni / Grischun": "Graubünden",
    Ticino: "Tessin",
    Vaud: "Waadt",
    "Valais / Wallis": "Wallis",
    Neuchâtel: "Neuenburg",
    Genève: "Genf",
  },
};

module.exports = {
  download: async function (basemap, version) {
    const response = await fetch(config[version.validFrom].dataUrl);
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
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${
      basemap.id
    }/${version.validFrom}/${config[version.validFrom].featuresPath}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
    helpers.convertToGeojson(inputFeaturesPath, outputFeaturesPath, "");
    helpers.setProperties(
      outputFeaturesPath,
      config[version.validFrom].featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.convertToTopojson(outputFeaturesPath, "features");

    // generate water topojson file
    const inputWaterPath = `${__dirname}/../../00-download-basemaps/data/${
      basemap.id
    }/${version.validFrom}/${config[version.validFrom].waterPath}`;
    const outputWaterPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/water.json`;
    helpers.convertToGeojson(inputWaterPath, outputWaterPath, "-drop fields=*");
    helpers.convertToTopojson(outputWaterPath, "water");

    // merge features and water into single topojson file
    const outputPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
    helpers.mergeTopojsons(outputFeaturesPath, outputWaterPath, outputPath);
  },
};
