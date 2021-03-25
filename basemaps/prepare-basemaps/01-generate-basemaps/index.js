const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const basemaps = require("../basemaps.json");

function convertToGeojson(fileName, featuresPath, commandExtension) {
  const fullPath = path.join(__dirname, "../", featuresPath);
  shell.exec(
    `npx mapshaper -i ${fullPath} encoding=utf8 -proj wgs84 ${commandExtension} -o ${fileName} force format=geojson`
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

function convertToTopojson(fileName, name) {
  shell.exec(
    `npx mapshaper -i ${fileName} encoding=utf8 -proj wgs84 -simplify 20% -rename-layers ${name} -o ${fileName} force format=topojson `
  );
}

function mergeTopojsons(path) {
  shell.exec(
    `npx mapshaper -i combine-files ${path}-features.json ${path}-outlines.json  -o ${path}.json force format=topojson`
  );
}

async function main() {
  for (let basemap of basemaps) {
    for (let version of basemap.versions) {
      if (version.data.entities.featuresPath) {
        const fileName = `${__dirname}/data/${basemap.id}-${version.validFrom}-features.json`;
        convertToGeojson(
          fileName,
          version.data.entities.featuresPath,
          "-filter 'GF === 4'"
        );
        setProperties(
          fileName,
          version.data.entities.featuresPropertyMapping,
          version.data.entities.rewriteProperties
        );
        convertToTopojson(fileName, "features");
      }

      if (version.data.entities.outlinesPath) {
        const path = `${__dirname}/data/${basemap.id}-${version.validFrom}`;
        const fileName = `${__dirname}/data/${basemap.id}-${version.validFrom}-outlines.json`;
        convertToGeojson(
          fileName,
          version.data.entities.outlinesPath,
          "-filter 'GF === 4' -innerlines"
        );
        convertToTopojson(fileName, "outlines");
        mergeTopojsons(path);
      }
    }
  }
}

main();
