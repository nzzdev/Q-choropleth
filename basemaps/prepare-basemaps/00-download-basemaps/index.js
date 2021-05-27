let basemaps = require("../config/basemaps.js");

async function main() {
  try {
    // Allow to run step only for a single basemap `npm run download-basemaps --basemap=ch-municipalities-geographic`
    if (process.env.npm_config_basemap) {
      basemaps = basemaps.filter(
        (basemap) => basemap.id === process.env.npm_config_basemap
      );
    }

    for (let basemap of basemaps) {
      for (let version of basemap.versions) {
        if (version.data.entities.download) {
          await version.data.entities.download(basemap, version);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

main();
