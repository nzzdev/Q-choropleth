const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://daten.gdz.bkg.bund.de/produkte/vg/vg1000_ebenen_0101/aktuell/vg1000_01-01.gk3.shape.ebenen.zip",
  featuresPath:
    "./vg1000_01-01.gk3.shape.ebenen/vg1000_ebenen_0101/VG1000_KRS.shp",
  outlinesPath:
    "./vg1000_01-01.gk3.shape.ebenen/vg1000_ebenen_0101/VG1000_LAN.shp",
  featuresPropertyMapping: {
    ags: "AGS",
    name: "GEN",
    nuts: "NUTS",
  },
  rewriteProperties: {
    "03458": "Kreis Oldenburg",
    "03459": "Kreis Osnabrück",
    "06633": "Kreis Kassel",
    "07335": "Kreis Kaiserslautern",
    "08125": "Kreis Heilbronn",
    "08215": "Kreis Karlsruhe",
    "09184": "Kreis München",
    "09187": "Kreis Rosenheim",
    "09274": "Kreis Landshut",
    "09275": "Kreis Passau",
    "09375": "Kreis Regensburg",
    "09471": "Kreis Bamberg",
    "09472": "Kreis Bayreuth",
    "09473": "Kreis Coburg",
    "09475": "Kreis Hof",
    "09571": "Kreis Ansbach",
    "09573": "Kreis Fürth",
    "09671": "Kreis Aschaffenburg",
    "09678": "Kreis Schweinfurt",
    "09679": "Kreis Würzburg",
    "09772": "Kreis Augsburg",
    13072: "Kreis Rostock",
    14729: "Kreis Leipzig",
  },
};

module.exports = {
  download: async function (basemap, version) {
    const response = await fetch(config.dataUrl);
    if (response.ok) {
      response.body.pipe(
        unzipper.Extract({
          path: `${__dirname}/../../00-download-basemaps/data/${basemap.id}-${version.validFrom}`,
        })
      );
    }
  },
  transform: async function (helpers, basemap, version) {
    // generate features topojson file
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}-${version.validFrom}/${config.featuresPath}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}-${version.validFrom}/features.json`;
    helpers.convertToGeojson(
      inputFeaturesPath,
      outputFeaturesPath,
      "-filter 'GF === 4'"
    );
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.convertToTopojson(outputFeaturesPath, "features");

    // generate outlines topojson file
    const inputOutlinesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}-${version.validFrom}/${config.outlinesPath}`;
    const outputOutlinesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}-${version.validFrom}/outlines.json`;
    helpers.convertToGeojson(
      inputOutlinesPath,
      outputOutlinesPath,
      "-filter 'GF === 4' -innerlines"
    );
    helpers.convertToTopojson(outputOutlinesPath, "outlines");

    // merge features and outlines into single topojson file
    const outputPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}-${version.validFrom}/${basemap.id}-${version.validFrom}.json`;
    helpers.mergeTopojsons(outputFeaturesPath, outputOutlinesPath, outputPath);
  },
};
