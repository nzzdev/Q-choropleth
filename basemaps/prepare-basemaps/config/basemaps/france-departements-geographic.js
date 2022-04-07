const unzipper = require("unzipper");
const fetch = require("node-fetch");

const config = {
  dataUrl:
    "https://gisco-services.ec.europa.eu/distribution/v2/nuts/download/ref-nuts-2021-10m.geojson.zip",
  featuresPath: "./NUTS_RG_10M_2021_4326_LEVL_3.geojson",
  featuresPropertyMapping: {
    id: "NUTS_ID",
    name: "NAME_LATN",
    nuts: "NUTS_ID",
  },
  rewriteProperties: {},
  addProperties: [
    {
      id: "FRK21",
      DEP: "1",
    },
    {
      id: "FRE21",
      DEP: "2",
    },
    {
      id: "FRK11",
      DEP: "3",
    },
    {
      id: "FRL01",
      DEP: "4",
    },
    {
      id: "FRL02",
      DEP: "5",
    },
    {
      id: "FRL03",
      DEP: "6",
    },
    {
      id: "FRK22",
      DEP: "7",
    },
    {
      id: "FRF21",
      DEP: "8",
    },
    {
      id: "FRJ21",
      DEP: "9",
    },
    {
      id: "FRF22",
      DEP: "10",
    },
    {
      id: "FRJ11",
      DEP: "11",
    },
    {
      id: "FRJ22",
      DEP: "12",
    },
    {
      id: "FRL04",
      DEP: "13",
    },
    {
      id: "FRD11",
      DEP: "14",
    },
    {
      id: "FRK12",
      DEP: "15",
    },
    {
      id: "FRI31",
      DEP: "16",
    },
    {
      id: "FRI32",
      DEP: "17",
    },
    {
      id: "FRB01",
      DEP: "18",
    },
    {
      id: "FRI21",
      DEP: "19",
    },
    {
      id: "FRC11",
      DEP: "21",
    },
    {
      id: "FRH01",
      DEP: "22",
    },
    {
      id: "FRI22",
      DEP: "23",
    },
    {
      id: "FRI11",
      DEP: "24",
    },
    {
      id: "FRC21",
      DEP: "25",
    },
    {
      id: "FRK23",
      DEP: "26",
    },
    {
      id: "FRD21",
      DEP: "27",
    },
    {
      id: "FRB02",
      DEP: "28",
    },
    {
      id: "FRH02",
      DEP: "29",
    },
    {
      id: "FRM01",
      DEP: "2A",
    },
    {
      id: "FRM02",
      DEP: "2B",
    },
    {
      id: "FRJ12",
      DEP: "30",
    },
    {
      id: "FRJ23",
      DEP: "31",
    },
    {
      id: "FRJ24",
      DEP: "32",
    },
    {
      id: "FRI12",
      DEP: "33",
    },
    {
      id: "FRJ13",
      DEP: "34",
    },
    {
      id: "FRH03",
      DEP: "35",
    },
    {
      id: "FRB03",
      DEP: "36",
    },
    {
      id: "FRB04",
      DEP: "37",
    },
    {
      id: "FRK24",
      DEP: "38",
    },
    {
      id: "FRC22",
      DEP: "39",
    },
    {
      id: "FRI13",
      DEP: "40",
    },
    {
      id: "FRB05",
      DEP: "41",
    },
    {
      id: "FRK25",
      DEP: "42",
    },
    {
      id: "FRK13",
      DEP: "43",
    },
    {
      id: "FRG01",
      DEP: "44",
    },
    {
      id: "FRB06",
      DEP: "45",
    },
    {
      id: "FRJ25",
      DEP: "46",
    },
    {
      id: "FRI14",
      DEP: "47",
    },
    {
      id: "FRJ14",
      DEP: "48",
    },
    {
      id: "FRG02",
      DEP: "49",
    },
    {
      id: "FRD12",
      DEP: "50",
    },
    {
      id: "FRF23",
      DEP: "51",
    },
    {
      id: "FRF24",
      DEP: "52",
    },
    {
      id: "FRG03",
      DEP: "53",
    },
    {
      id: "FRF31",
      DEP: "54",
    },
    {
      id: "FRF32",
      DEP: "55",
    },
    {
      id: "FRH04",
      DEP: "56",
    },
    {
      id: "FRF33",
      DEP: "57",
    },
    {
      id: "FRC12",
      DEP: "58",
    },
    {
      id: "FRE11",
      DEP: "59",
    },
    {
      id: "FRE22",
      DEP: "60",
    },
    {
      id: "FRD13",
      DEP: "61",
    },
    {
      id: "FRE12",
      DEP: "62",
    },
    {
      id: "FRK14",
      DEP: "63",
    },
    {
      id: "FRI15",
      DEP: "64",
    },
    {
      id: "FRJ26",
      DEP: "65",
    },
    {
      id: "FRJ15",
      DEP: "66",
    },
    {
      id: "FRF11",
      DEP: "67",
    },
    {
      id: "FRF12",
      DEP: "68",
    },
    {
      id: "FRK26",
      DEP: "69",
    },
    {
      id: "FRC23",
      DEP: "70",
    },
    {
      id: "FRC13",
      DEP: "71",
    },
    {
      id: "FRG04",
      DEP: "72",
    },
    {
      id: "FRK27",
      DEP: "73",
    },
    {
      id: "FRK28",
      DEP: "74",
    },
    {
      id: "FR101",
      DEP: "75",
    },
    {
      id: "FRD22",
      DEP: "76",
    },
    {
      id: "FR102",
      DEP: "77",
    },
    {
      id: "FR103",
      DEP: "78",
    },
    {
      id: "FRI33",
      DEP: "79",
    },
    {
      id: "FRE23",
      DEP: "80",
    },
    {
      id: "FRJ27",
      DEP: "81",
    },
    {
      id: "FRJ28",
      DEP: "82",
    },
    {
      id: "FRL05",
      DEP: "83",
    },
    {
      id: "FRL06",
      DEP: "84",
    },
    {
      id: "FRG05",
      DEP: "85",
    },
    {
      id: "FRI34",
      DEP: "86",
    },
    {
      id: "FRI23",
      DEP: "87",
    },
    {
      id: "FRF34",
      DEP: "88",
    },
    {
      id: "FRC14",
      DEP: "89",
    },
    {
      id: "FRC24",
      DEP: "90",
    },
    {
      id: "FR104",
      DEP: "91",
    },
    {
      id: "FR105",
      DEP: "92",
    },
    {
      id: "FR106",
      DEP: "93",
    },
    {
      id: "FR107",
      DEP: "94",
    },
    {
      id: "FR108",
      DEP: "95",
    },
  ],
  bbox: "-5.66,41.0,10.8,51.51",
};

module.exports = {
  download: async function (basemap, version) {
    const response = await fetch(config.dataUrl);
    if (response.ok) {
      response.body.pipe(
        unzipper.Extract({
          path: `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}`,
        })
      );
    }
  },
  transform: async function (helpers, basemap, version) {
    // generate features topojson file
    const inputFeaturesPath = `${__dirname}/../../00-download-basemaps/data/${basemap.id}/${version.validFrom}/${config.featuresPath}`;
    const outputFeaturesPath = `${__dirname}/../../01-generate-basemaps/data/${basemap.id}/${version.validFrom}/${basemap.id}.json`;
    helpers.convertToGeojson(
      inputFeaturesPath,
      outputFeaturesPath,
      `-filter 'CNTR_CODE === "FR"' -clip bbox=${config.bbox}`
    );
    helpers.setProperties(
      outputFeaturesPath,
      config.featuresPropertyMapping,
      config.rewriteProperties
    );
    helpers.addProperties(outputFeaturesPath, config.addProperties);
    helpers.convertToTopojson(outputFeaturesPath, "features");
  },
};
