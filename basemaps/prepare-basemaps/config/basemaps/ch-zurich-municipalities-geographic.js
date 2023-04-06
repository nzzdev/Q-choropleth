const fs = require("fs");
const shell = require("shelljs");
const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  "2023-01-01T00:00:00.000Z": {
    dataUrl: "https://www.web.statistik.zh.ch/ogd/daten/ressourcen/KTZH_00000236_00001266.zip",
    featuresPath:
      // had to import the .shp file into mapshaper, use '-proj wgs84' to fix the coordinate system
      // and export it as geojson, so the process here works
      "./GEN_GEMEINDEundAUSZAEHLKREISE_SEEN_mapshaper_export.json",
    waterPath:
      "./GEN_GEMEINDEundAUSZAEHLKREISE_SEEN_mapshaper_export.json",
    featuresPropertyMapping: {
      id: "GEBIET_C",
      name: "GEBIET_N",
    },
    rewriteProperties: {},
  },
  "2019-01-01T00:00:00.000Z": {
    dataUrl: "https://www.web.statistik.zh.ch/data/KTZH_151_Gemeinden2019.zip",
    featuresPath:
      "./GEN_A4_GEMEINDEN_2019_epsg4326_json/GEN_A4_GEMEINDEN_2019_epsg4326.json",
    waterPath:
      "./GEN_A4_GEMEINDEN_2019_epsg4326_json/GEN_A4_GEMEINDEN_SEEN_2019_epsg4326.json",
    featuresPropertyMapping: {
      id: "BFS",
      name: "NAME",
    },
    rewriteProperties: {},
  },
};

function dissolveMunicipality(inputFilePath, municipality) {
  const outputFilePath = inputFilePath.replace(".json", `_${municipality.id}_dissolved.json`); // somehow the command 'force' on mapshaper doesn't work...
  shell.exec(
    `npx mapshaper -i ${inputFilePath} \
    -dissolve where='id.endsWith(${municipality.id})' copy-fields='id' \
    -o ${outputFilePath}`
  );
  const geojson = require(outputFilePath);
  const feature = geojson.features.find(feature => feature.properties.id.endsWith(municipality.id));

  feature.properties.id = municipality.id;
  feature.properties.name = municipality.name;

  fs.writeFileSync(inputFilePath, JSON.stringify(geojson));
  fs.rmSync(outputFilePath);
}

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
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${config[version.validFrom].featuresPath}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
    helpers.convertToGeojson(
      inputFeaturesPath,
      outputFeaturesPath,
      "-filter 'ART_C !== 3'"
    );
    helpers.setProperties(
      outputFeaturesPath,
      config[version.validFrom].featuresPropertyMapping,
      config[version.validFrom].rewriteProperties
    );
    // ...
    dissolveMunicipality(
      outputFeaturesPath,
      { id: "261", name: "Zürich" }
    );
    dissolveMunicipality(
      outputFeaturesPath,
      { id: "230", name: "Winterthur" }
    );

    helpers.convertToTopojson(outputFeaturesPath, "features");

    // generate water topojson file
    const inputWaterPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${config[version.validFrom].waterPath}`;
    const outputWaterPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/water.json`;
    helpers.convertToGeojson(
      inputWaterPath,
      outputWaterPath,
      "-filter 'ART_C === 3' -drop fields=*"
    );
    helpers.convertToTopojson(outputWaterPath, "water");

    // merge features and water into single topojson file
    const outputPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
    helpers.mergeTopojsons(outputFeaturesPath, outputWaterPath, outputPath);
  },
};
