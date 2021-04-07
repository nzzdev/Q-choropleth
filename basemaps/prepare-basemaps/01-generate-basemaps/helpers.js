const shell = require("shelljs");
const fs = require("fs");

function convertToGeojson(inputPath, outputPath, commandExtension) {
  shell.exec(
    `npx mapshaper -i ${inputPath} encoding=utf8 -proj wgs84 ${commandExtension} -o ${outputPath} force format=geojson`
  );
}

function getNameValue(defaultValue, rewriteProperties, properties) {
  // replace all ß with ss
  let name = defaultValue.replace(/ß/g, "ss");

  // rewrite some name values as defined in rewriteProperties
  for (let [rewriteKey, rewriteValue] of Object.entries(rewriteProperties)) {
    for (let [propertyKey, propertyValue] of Object.entries(properties)) {
      if (String(propertyValue) === String(rewriteKey)) {
        name = rewriteValue;
      }
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
        properties[key] = String(feature.properties[value]);
        if (key === "name") {
          const defaultValue = String(feature.properties[value]);
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

function convertToTopojson(path, name) {
  shell.exec(
    `npx mapshaper -i ${path} encoding=utf8 -proj wgs84 -rename-layers ${name} -o ${path} force format=topojson `
  );
}

function mergeTopojsons(firstPath, secondPath, outputPath) {
  shell.exec(
    `npx mapshaper -i combine-files ${firstPath} ${secondPath}  -o ${outputPath} force format=topojson`
  );
}

module.exports = {
  setProperties,
  convertToGeojson,
  convertToTopojson,
  mergeTopojsons,
};
