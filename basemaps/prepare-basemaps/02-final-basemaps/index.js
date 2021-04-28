const fs = require("fs");
const basemaps = require("../config/basemaps.js");

async function main() {
  try {
    for (let basemap of basemaps) {
      for (let version of basemap.versions) {
        const path = `${__dirname}/../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
        if (fs.existsSync(path)) {
          version.data.entities = require(path);
        }
      }

      const fileName = basemap.id;
      delete basemap.id;
      const directory = `${__dirname}/data`;
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      fs.writeFileSync(
        `${directory}/${fileName}.json`,
        JSON.stringify(basemap)
      );
    }
  } catch (error) {
    console.log(error);
  }
}

main();
