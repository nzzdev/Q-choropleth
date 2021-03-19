const unzipper = require("unzipper");
const fetch = require("node-fetch");
const basemaps = require("../basemaps.json");

async function main() {
  for (let basemap of basemaps) {
    for (let version of basemap.versions) {
      if (version.data.entities.dataUrl) {
        const response = await fetch(version.data.entities.dataUrl);
        if (response.ok) {
          response.body.pipe(
            unzipper.Extract({
              path: `${__dirname}/data`,
            })
          );
        }
      }
    }
  }
}

main();
