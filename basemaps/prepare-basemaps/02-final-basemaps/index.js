const fs = require("fs");
let basemaps = require("../config/basemaps.js");

async function main() {
  const directory = `${__dirname}/data`;

  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Allow to run step only for a single basemap `npm run final-basemaps --basemap=ch-municipalities-geographic`
    if (process.env.npm_config_basemap) {
      basemaps = basemaps.filter(
        (basemap) => basemap.id === process.env.npm_config_basemap
      );
    }

    for (let basemap of basemaps) {
      const basemapId = basemap.id;
      delete basemap.id;
      const newVersions = [];
      for (let version of basemap.versions) {
        const path = `${__dirname}/../01-generate-basemaps/data/${basemapId}/${version.validFrom}/`;
        if (fs.existsSync(path + `${basemapId}.json`)) {
          version.data.entities = require(path + `${basemapId}.json`);
        } else {
          fs.readdirSync(path)
            .filter((file) => file.endsWith(".json"))
            .forEach((file, index) => {
              if (index === 0) {
                version.data.entities = require(path + file);
                version.file = file.replace(".json", "");
              } else {
                const deepCopy = JSON.parse(JSON.stringify(version));

                // TODO: 'Ozeanien' (from basemap 'world-countries-geographic') needs mercator projection. Replace this hack with a proper solution.
                if (file.startsWith("ozeanien")) {
                  deepCopy.data.config.projection = "mercator";
                }

                newVersions.push(deepCopy);
                newVersions[
                  newVersions.length - 1
                ].data.entities = require(path + file);
                newVersions[newVersions.length - 1].file = file.replace(
                  ".json",
                  ""
                );
              }
            });
        }
      }
      if (newVersions.length > 0) basemap.versions.push(...newVersions);

      fs.writeFileSync(
        `${directory}/${basemapId}.json`,
        JSON.stringify(basemap)
      );
    }
  } catch (error) {
    console.log(error);
  }
}

main();
