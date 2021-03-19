const fs = require("fs");
const basemaps = require("../basemaps.json");

async function main() {
  for (let basemap of basemaps) {
    for (let version of basemap.versions) {
      if (version.data.entities.dataPath) {
        const geojson = require(`${__dirname}/../01-generate-basemaps/data/${basemap.id}-${version.validFrom}.json`);
        version.data.entities = geojson;
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
}

main();
