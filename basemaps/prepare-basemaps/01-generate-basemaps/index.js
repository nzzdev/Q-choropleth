const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const basemaps = require("../basemaps.json");

function convertToGeojson(fileName, dataPath) {
  const fullPath = path.join(__dirname, "../", dataPath);
  shell.exec(
    `npx mapshaper -i ${fullPath} -proj wgs84 -o ${fileName} force format=geojson`
  );
}

function getNameValue(defaultValue, rewriteProperties, properties) {
  // replace all ß with ss
  let name = defaultValue.replace(/ß/g, "ss");

  // rewrite some name values as defined in rewriteProperties
  for (let [rewriteKey, rewriteValue] of Object.entries(rewriteProperties)) {
    for (let [propertyKey, propertyValue] of Object.entries(properties))
      if (propertyValue === rewriteKey) {
        name = rewriteValue;
      }
  }

  return name;
}

function setProperties(fileName, propertyMapping, rewriteProperties) {
  const geojson = require(fileName);
  for (let feature of geojson.features) {
    const properties = {};
    for (let [key, value] of Object.entries(propertyMapping)) {
      if (feature.properties[value]) {
        properties[key] = feature.properties[value];
        if (key === "name") {
          const defaultValue = feature.properties[value];
          properties[key] = getNameValue(
            defaultValue,
            rewriteProperties,
            feature.properties
          );
        }
      }
    }
    feature.properties = properties;
  }
  fs.writeFileSync(fileName, JSON.stringify(geojson));
}

function convertToTopojson(fileName) {
  shell.exec(
    `npx mapshaper -i ${fileName} -simplify 20% -o ${fileName} force format=topojson`
  );
}

async function main() {
  for (let basemap of basemaps) {
    for (let version of basemap.versions) {
      if (version.data.entities.dataPath) {
        const fileName = `${__dirname}/data/${basemap.id}-${version.validFrom}.json`;
        convertToGeojson(fileName, version.data.entities.dataPath);
        setProperties(
          fileName,
          version.data.entities.dataPropertyMapping,
          version.data.entities.rewriteProperties
        );
        convertToTopojson(fileName);
      }
    }
  }
}

main();
