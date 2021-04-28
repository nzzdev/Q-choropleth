const basemaps = require("../config/basemaps.js");

async function main() {
  try {
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
