const shell = require("shelljs");
const fs = require("fs");

function convertToGeojson(inputFilePath, outputFilePath, commandExtension) {
  shell.exec(
    `npx mapshaper -i ${inputFilePath} encoding=utf8 -proj wgs84 ${commandExtension} -o ${outputFilePath} force format=geojson`
  );
}

function applyNamePropertyValueChanges(defaultValue) {
  // replace all ß with ss
  let name = defaultValue.replace(/ß/g, "ss");

  return name;
}

function rewritePropertyValue(propertyValue, propertyValuesToRewrite) {
  const valueToOverwrite = Object.keys(propertyValuesToRewrite).find(
    (valToOverwrite) => valToOverwrite === propertyValue
  );

  if (valueToOverwrite) {
    propertyValue = propertyValuesToRewrite[valueToOverwrite];
  }

  return propertyValue;
}

function setProperties(inputFilePath, propertyMapping, propertyValuesToRewrite) {
  const geojson = require(inputFilePath);
  for (let feature of geojson.features) {
    const properties = {};

    // Apply property mapping
    for (let [key, value] of Object.entries(propertyMapping)) {
      if (feature.properties[value]) {
        properties[key] = String(feature.properties[value]);

        if (key === "name") {
          const defaultValue = String(feature.properties[value]);
          properties[key] = applyNamePropertyValueChanges(defaultValue);
        }

        properties[key] = rewritePropertyValue(
          properties[key],
          propertyValuesToRewrite
        );
      }
    }

    feature.properties = properties;
  }
  fs.writeFileSync(inputFilePath, JSON.stringify(geojson));
}

/**
 * Adds/Overwrites properties to either (1) id matching 'feature' entries or (2) all 'feature' entries of given geojson
 * @param {string} outputFilePath - Path to output file (usually '${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`')
 * @param {Array.<Object>} groupedProperties - Properties to be applied for either (1) id matching 'feature' entry or (2) all 'feature' entries (if no id is set) of given geojson
 */
function addProperties(outputFilePath, groupedProperties) {
  if (Array.isArray(groupedProperties) && groupedProperties.length > 0) {
    const geojson = require(outputFilePath);

    for (const properties of groupedProperties) {
      if (properties.id) {
        const matchingFeature = geojson.features.find(
          (feature) => feature.properties.id === properties.id
        );

        if (matchingFeature) {
          Object.assign(matchingFeature.properties, properties);
        } else {
          console.warn(
            `No matching 'feature' found with id: '${properties.id}', in geojson with name: '${outputFilePath}'.`
          );
        }
      } else {
        for (const feature of geojson.features) {
          Object.assign(feature.properties, properties);
        }
      }
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(geojson));
  }
}

function convertToTopojson(inputFilePath, name, commandExtension = "") {
  shell.exec(
    `npx mapshaper -i ${inputFilePath} encoding=utf8 -proj init=wgs84 -rename-layers ${name} ${commandExtension} -o ${inputFilePath} force format=topojson `
  );
}

function mergeTopojsons(firstPath, secondPath, outputFilePath) {
  shell.exec(
    `npx mapshaper -i combine-files ${firstPath} ${secondPath} -o ${outputFilePath} force format=topojson`
  );
}

module.exports = {
  addProperties,
  convertToGeojson,
  convertToTopojson,
  mergeTopojsons,
  setProperties,
};
