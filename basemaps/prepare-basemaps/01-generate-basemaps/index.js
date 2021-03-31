const helpers = require("./helpers.js");
const basemaps = require("../config/basemaps.js");

async function main() {
  try {
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
