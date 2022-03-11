const shell = require("shelljs");
const fs = require("fs");

function convertToGeojson(inputPath, outputPath, commandExtension) {
  shell.exec(
    `npx mapshaper -i ${inputPath} encoding=utf8 -proj wgs84 ${commandExtension} -o ${outputPath} force format=geojson`
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

function setProperties(fileName, propertyMapping, propertyValuesToRewrite) {
  const geojson = require(fileName);
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
  fs.writeFileSync(fileName, JSON.stringify(geojson));
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
            `No matching 'feature' found with id: '${properties.id}', in geojson with name: '${fileName}'.`
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
  addProperties,
  convertToGeojson,
  convertToTopojson,
  mergeTopojsons,
};
