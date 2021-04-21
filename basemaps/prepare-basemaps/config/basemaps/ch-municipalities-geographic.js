const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  "2021-01-01T00:00:00.000Z": {
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
  },
  "2020-01-01T00:00:00.000Z": {
    dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/11927607/master",
    featuresPath:
      "./2020_GEOM_TK/GEOM_2020/01_INST/Gesamtfl�che_gf/K4_polg20200101_gf/K4polg20200101gf_ch2007Poly.shp",
    waterPath:
      "./2020_GEOM_TK/GEOM_2020/00_TOPO/K4_seenyyyymmdd/k4seenyyyymmdd11_ch2007Poly.shp",
    featuresPropertyMapping: {
      id: "GDENR",
      name: "GDENAME",
    },
    rewriteProperties: {},
  },
  "2019-01-01T00:00:00.000Z": {
    dataUrl: "https://www.bfs.admin.ch/bfsstatic/dam/assets/7546178/master",
    featuresPath:
      "./2019_THK_PRO/PRO/01_INST/Gesamtfl�che_gf/K4_polg20190101_gf/K4polg20190101gf_ch2007Poly.shp",
    waterPath:
      "./2019_THK_PRO/PRO/00_TOPO/K4_seenyyyymmdd/k4seenyyyymmdd11_ch2007Poly.shp",
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
