const fs = require("fs");
const basemaps = require("../basemaps.json");

async function main() {
  for (let basemap of basemaps) {
    for (let version of basemap.versions) {
      if (version.data.entities.dataUrl) {
        console.log(version.data.entities.dataUrl);
      }
    }
    const fileName = basemap.id;
    delete basemap.id;
    fs.writeFileSync(
      `${__dirname}/../final-basemaps/${fileName}.json`,
      JSON.stringify(basemap)
    );
  }
}

main();
