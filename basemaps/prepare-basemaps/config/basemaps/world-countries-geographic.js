const fs = require("fs");

const config = {
  featuresPropertyMapping: {
    name: "name",
    iso3: "iso3",
    centroid_lat: "centroid_lat",
    centroid_lon: "centroid_lon",
    population: "population",
    status: "status",
  },
  rewriteProperties: {},
};

module.exports = {
  download: async function (basemap, version) {
    console.log("Nothing to download. Please copy the GeoJSON file(s) to here:", `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/`);
  },
  transform: async function (helpers, basemap, version) {
    // generate features topojson file
    const directory = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}`;
    fs.readdirSync(directory)
      .filter(file => file.endsWith(".json"))
      .forEach((file) => {
        console.log("Transforming...", file);
        const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${file}`;
        const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${file}`;
        helpers.convertToGeojson(inputFeaturesPath, outputFeaturesPath, "");
        helpers.setProperties(
          outputFeaturesPath,
          config.featuresPropertyMapping,
          config.rewriteProperties
        );
        helpers.convertToTopojson(outputFeaturesPath, "features");
    });
  },
};
