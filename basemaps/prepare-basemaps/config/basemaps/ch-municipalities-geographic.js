const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  "2021-07-01T00:00:00.000Z": {
    dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/17964056/master",
    featuresPath: "./ggg_2021-LV95/shp/k4g21_01072021.shp",
    waterPath: "./ggg_2021-LV95/shp/k4s21.shp",
    featuresPropertyMapping: {
      id: "GMDNR",
      name: "GMDNAME",
    },
    rewriteProperties: {},
  },
  "2021-04-18T00:00:00.000Z": {
    dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/16804410/master",
    featuresPath: "./ggg_2021-LV95/shp/k4g21_18042021.shp",
    waterPath: "./ggg_2021-LV95/shp/k4s21.shp",
    featuresPropertyMapping: {
      id: "GMDNR",
      name: "GMDNAME",
    },
    rewriteProperties: {},
  },
  "2021-01-01T00:00:00.000Z": {
    dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/16804410/master",
    featuresPath: "./ggg_2021-LV95/shp/k4g21_01012021.shp",
    waterPath: "./ggg_2021-LV95/shp/k4s21.shp",
    featuresPropertyMapping: {
      id: "GMDNR",
      name: "GMDNAME",
    },
    rewriteProperties: {},
  },
  "2020-01-01T00:00:00.000Z": {
    dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/11947559/master",
    featuresPath: "./ggg_2020-LV95/shp/K4g20.shp",
    waterPath: "./ggg_2020-LV95/shp/k4s20.shp",
    featuresPropertyMapping: {
      id: "GMDNR",
      name: "GMDNAME",
    },
    rewriteProperties: {},
  },
  "2019-01-01T00:00:00.000Z": {
    dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/7566557/master",
    featuresPath: "./ggg_2019-LV95/shp/K4g19.shp",
    waterPath: "./ggg_2019-LV95/shp/k4s19.shp",
    featuresPropertyMapping: {
      id: "GDENR",
      name: "GDENAME",
    },
    rewriteProperties: {},
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
      config[version.validFrom].rewriteProperties
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
