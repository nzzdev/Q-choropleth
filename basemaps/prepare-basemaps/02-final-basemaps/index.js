const fs = require("fs");
const basemaps = require("../config/basemaps.js");

async function main() {
  try {
    for (let basemap of basemaps) {
      for (let version of basemap.versions) {
        const path = `${__dirname}/../01-generate-basemaps/data/${basemap.id}-${version.validFrom}/${basemap.id}-${version.validFrom}.json`;
        if (fs.existsSync(path)) {
          version.data.entities = require(path);
        }
      }

      const fileName = basemap.id;
      delete basemap.id;
      const dir = `${__dirname}/data`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      fs.writeFileSync(`${dir}/${fileName}.json`, JSON.stringify(basemap));
    }
  } catch (error) {
    console.log(error);
  }
}

main();
