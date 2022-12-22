const fs = require("fs");
const d3Geo = require("d3-geo");
const d3GeoProj = require("d3-geo-projection");

const config = {
  featuresFile: "FINAL_laender_fuer_choropleth_europa.json",
  featuresPropertyMapping: {
    name: "NAME_EN",
    iso2: "ISO_A2_EH",
    iso3: "ADM0_A3_UA",
    showAsBubble: "showAsBubble",
  },
  rewriteProperties: {},
};

function setShowAsBubbleProperty(inputFilePath, regions = []) {
  const geojson = require(inputFilePath);
  for (let feature of geojson.features) {
    if (regions.includes(feature.properties.iso3)) {
      feature.properties.showAsBubble = "true";
    }
  }
  fs.writeFileSync(inputFilePath, JSON.stringify(geojson));
}

module.exports = {
  download: async function (basemap, version) {
    console.log("Nothing to download. Please copy the GeoJSON file(s) to here:", `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/`);
  },
  transform: async function (helpers, basemap, version) {
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${config.featuresFile}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${config.featuresFile}`;
    
    // read geojson and project the data using the azimuthalEqualArea projection
    // example: https://observablehq.com/@recifs/project-and-clip
    const projectedBaseMap = d3GeoProj.geoProject(
      JSON.parse(
        fs.readFileSync(
          inputFeaturesPath,
          "utf-8"
        )
      ),
      d3Geo.geoAzimuthalEqualArea()
        // rotate whole map, so europe is centered correctly
        .rotate(
          [-10, -52]
        )
        // add a "bounding box" around europe, because we have to cut some countries (e.g. Russia is way too big)
        .fitSize(
          [100, 100],
          {
            type: "MultiPoint",
            coordinates: [ [-10, 27], [60, 65] ]
          }
        )
        // clip everything outside the bounding box
        .clipExtent(
          [ [0, 0], [100, 100] ]
        )
    );

    // export the projected data as a geojson
    fs.writeFileSync(
      outputFeaturesPath,
      JSON.stringify(projectedBaseMap)
    );

    // map properties using featuresPropertyMapping from config above
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );

    // render these regions as a bubble (circle), instead as a feature (path)
    setShowAsBubbleProperty(
      outputFeaturesPath,
      ["AND", "LIE", "MCO", "MLT", "SMR", "VAT"],
    );

    // convert to TopoJSON, simplify geometries and clip to bounding box
    helpers.convertToTopojson(
      outputFeaturesPath,
      "features",
      `-simplify 15% keep-shapes`
    );
  },
};
