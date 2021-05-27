const helpers = require("./helpers.js");
let basemaps = require("../config/basemaps.js");

async function main() {
  try {
    // Allow to run step only for a single basemap `npm run generate-basemaps --basemap=ch-municipalities-geographic`
    if (process.env.npm_config_basemap) {
      basemaps = basemaps.filter(
        (basemap) => basemap.id === process.env.npm_config_basemap
      );
    }

    for (let basemap of basemaps) {
      for (let version of basemap.versions) {
        if (version.data.entities.transform) {
          await version.data.entities.transform(helpers, basemap, version);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

main();
