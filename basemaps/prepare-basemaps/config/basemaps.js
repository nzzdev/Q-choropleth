module.exports = [
  {
    id: "austria-states-geographic",
    title: "Österreich » Bundesländer",
    versions: [
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts",
            label: "© EuroGeographics",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              nuts: "NUTS",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/austria-states-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-districts-geographic",
    title: "Schweiz » Bezirke",
    versions: [
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "Bezirks Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-districts-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-cantons-geographic",
    title: "Schweiz » Kantone (geografisch)",
    versions: [
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-cantons-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-cantons-hexagon",
    title: "Schweiz » Kantone (hexagon)",
    versions: [
      {
        validFrom: "1997-01-01T00:00:00.000Z",
        data: {
          config: {
            displayEntityType: "code",
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              bfsNumber: "BfS Nummer",
              code: "Abkürzung",
            },
            projection: "mercator",
          },
          entities: [
            [
              null,
              null,
              { bfsNumber: "12", code: "BS", name: "Basel-Stadt" },
              { bfsNumber: "13", code: "BL", name: "Basel-Landschaft" },
              { bfsNumber: "14", code: "SH", name: "Schaffhausen" },
              { bfsNumber: "20", code: "TG", name: "Thurgau" },
              null,
            ],
            [
              null,
              { bfsNumber: "26", code: "JU", name: "Jura" },
              { bfsNumber: "11", code: "SO", name: "Solothurn" },
              { bfsNumber: "19", code: "AG", name: "Aargau" },
              { bfsNumber: "1", code: "ZH", name: "Zürich" },
              {
                bfsNumber: "15",
                code: "AR",
                name: "Appenzell Ausserrhoden",
              },
              {
                bfsNumber: "16",
                code: "AI",
                name: "Appenzell Innerrhoden",
              },
            ],
            [
              null,
              { bfsNumber: "24", code: "NE", name: "Neuenburg" },
              { bfsNumber: "2", code: "BE", name: "Bern" },
              { bfsNumber: "3", code: "LU", name: "Luzern" },
              { bfsNumber: "9", code: "ZG", name: "Zug" },
              { bfsNumber: "5", code: "SZ", name: "Schwyz" },
              { bfsNumber: "17", code: "SG", name: "St. Gallen" },
            ],
            [
              { bfsNumber: "22", code: "VD", name: "Waadt" },
              { bfsNumber: "10", code: "FR", name: "Freiburg" },
              { bfsNumber: "6", code: "OW", name: "Obwalden" },
              { bfsNumber: "7", code: "NW", name: "Nidwalden" },
              { bfsNumber: "4", code: "UR", name: "Uri" },
              { bfsNumber: "8", code: "GL", name: "Glarus" },
              { bfsNumber: "18", code: "GR", name: "Graubünden" },
            ],
            [
              { bfsNumber: "25", code: "GE", name: "Genf" },
              null,
              { bfsNumber: "23", code: "VS", name: "Wallis" },
              null,
              null,
              { bfsNumber: "21", code: "TI", name: "Tessin" },
              null,
            ],
          ],
        },
      },
    ],
  },
  {
    id: "ch-municipalities-geographic",
    title: "Schweiz » Gemeinden",
    versions: [
      {
        validFrom: "2022-05-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-municipalities-geographic.js"),
        },
      },
      {
        validFrom: "2022-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-municipalities-geographic.js"),
        },
      },
      {
        validFrom: "2021-07-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-municipalities-geographic.js"),
        },
      },
      {
        validFrom: "2021-04-18T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-municipalities-geographic.js"),
        },
      },
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-municipalities-geographic.js"),
        },
      },
      {
        validFrom: "2020-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-municipalities-geographic.js"),
        },
      },
      {
        validFrom: "2019-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-municipalities-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-arbeitsmarkt-regions-geographic",
    title: "Schweiz » Arbeitsmarktregionen",
    versions: [
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/en/home/statistics/regional-statistics/base-maps/cartographic-bases.assetdetail.15784603.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "Arbeitsmarktregionen ID",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-arbeitsmarkt-regions-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-ms-regions-geographic",
    title: "Schweiz » MS-Regionen",
    versions: [
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.bfs.admin.ch/bfs/en/home/statistics/regional-statistics/base-maps/cartographic-bases.assetdetail.15784603.html",
            label: "© BfS, ThemaKart",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "MS-Regionen ID",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-ms-regions-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-zurich-city-constituencies-geographic",
    title: "Schweiz » Zürich » Wahlkreise",
    versions: [
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.zh.ch/de/planen-bauen/geoinformation/geodaten/geodatenshop/vorlagen-fuer-administrativer-grenzen-und-karten.html",
            label: "Statistik Kt. Zürich",
          },
          config: {
            defaultEntityType: "key",
            entityTypes: {
              key: "Wahlkreis Bezeichnung",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-zurich-city-constituencies-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-zurich-city-districts-geographic",
    title: "Schweiz » Zürich » Stadtkreise",
    versions: [
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://data.stadt-zuerich.ch/dataset/geo_stadtkreise",
            label: "© Open Data Zürich",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "Kreis Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-zurich-city-districts-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-zurich-districts-geographic",
    title: "Schweiz » Zürich » Bezirke",
    versions: [
      {
        validFrom: "2019-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.zh.ch/de/planen-bauen/geoinformation/geodaten/geodatenshop/vorlagen-fuer-administrativer-grenzen-und-karten.html",
            label: "© Statistik Kt. Zürich",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "Bezirks Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-zurich-districts-geographic.js"),
        },
      },
    ],
  },
  {
    id: "ch-zurich-municipalities-geographic",
    title: "Schweiz » Zürich » Gemeinden",
    versions: [
      {
        validFrom: "2019-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.zh.ch/de/planen-bauen/geoinformation/geodaten/geodatenshop/vorlagen-fuer-administrativer-grenzen-und-karten.html",
            label: "© Statistik Kt. Zürich",
          },
          config: {
            defaultEntityType: "id",
            entityTypes: {
              id: "BfS Nummer",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/ch-zurich-municipalities-geographic.js"),
        },
      },
    ],
  },
  {
    id: "de-bundeslander-geographic",
    title: "Deutschland » Bundesländer (geografisch)",
    versions: [
      {
        validFrom: "2020-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://gdz.bkg.bund.de/index.php/default/digitale-geodaten/verwaltungsgebiete/verwaltungsgebiete-1-1-000-000-ebenen-stand-01-01-vg1000-ebenen-01-01.html",
            label: "© GeoBasis-DE / BKG",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: { ags: "AGS", name: "Name", nuts: "NUTS" },
            projection: "mercator",
          },
          entities: require("./basemaps/de-bundeslander-geographic.js"),
        },
      },
    ],
  },
  {
    id: "de-bundeslander-hexagon",
    title: "Deutschland » Bundesländer (hexagon)",
    versions: [
      {
        validFrom: "1990-01-01T00:00:00.000Z",
        data: {
          config: {
            displayEntityType: "code",
            defaultEntityType: "name",
            entityTypes: {
              ags: "AGS",
              code: "Abkürzung",
              name: "Name",
            },
            projection: "mercator",
          },
          entities: [
            [
              null,
              { ags: "01", code: "SH", name: "Schleswig-Holstein" },
              { ags: "13", code: "MV", name: "Mecklenburg-Vorpommern" },
            ],
            [
              { ags: "04", code: "HB", name: "Bremen" },
              { ags: "02", code: "HH", name: "Hamburg" },
              { ags: "12", code: "BB", name: "Brandenburg" },
            ],
            [
              { ags: "03", code: "NI", name: "Niedersachsen" },
              { ags: "15", code: "ST", name: "Sachsen-Anhalt" },
              { ags: "11", code: "BE", name: "Berlin" },
            ],
            [
              { ags: "05", code: "NW", name: "Nordrhein-Westfalen" },
              { ags: "16", code: "TH", name: "Thüringen" },
              { ags: "14", code: "SN", name: "Sachsen" },
            ],
            [
              { ags: "07", code: "RP", name: "Rheinland-Pfalz" },
              { ags: "06", code: "HE", name: "Hessen" },
              { ags: "09", code: "BY", name: "Bayern" },
            ],
            [
              { ags: "10", code: "SL", name: "Saarland" },
              { ags: "08", code: "BW", name: "Baden-Württemberg" },
              null,
            ],
          ],
        },
      },
    ],
  },
  {
    id: "de-landkreise-geographic",
    title: "Deutschland » Landkreise",
    versions: [
      {
        validFrom: "2020-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://gdz.bkg.bund.de/index.php/default/digitale-geodaten/verwaltungsgebiete/verwaltungsgebiete-1-1-000-000-ebenen-stand-01-01-vg1000-ebenen-01-01.html",
            label: "© GeoBasis-DE / BKG",
          },
          config: {
            defaultEntityType: "ags",
            entityTypes: { ags: "AGS", nuts: "NUTS" },
            projection: "mercator",
          },
          entities: require("./basemaps/de-landkreise-geographic.js"),
        },
      },
    ],
  },
  {
    id: "france-regions-geographic",
    title: "Frankreich » Regionen",
    versions: [
      {
        validFrom: "2018-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts",
            label: "© EuroGeographics",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              nuts: "NUTS",
              DEP: "DEP",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/france-regions-geographic.js"),
        },
      },
    ],
  },
  {
    id: "france-departements-geographic",
    title: "Frankreich » Departements",
    versions: [
      {
        validFrom: "2018-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts",
            label: "© EuroGeographics",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              nuts: "NUTS",
              DEP: "DEP",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/france-departements-geographic.js"),
        },
      },
    ],
  },
  {
    id: "france-departements-paris-geographic",
    title: "Frankreich » Departements » Paris",
    versions: [
      {
        validFrom: "2018-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts",
            label: "© EuroGeographics",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              nuts: "NUTS",
              DEP: "DEP",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/france-departements-paris-geographic.js"),
        },
      },
    ],
  },
  {
    id: "italy-regions-geographic",
    title: "Italien » Regionen",
    versions: [
      {
        validFrom: "2021-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts",
            label: "© EuroGeographics",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              nuts: "NUTS",
            },
            projection: "mercator",
          },
          entities: require("./basemaps/italy-regions-geographic.js"),
        },
      },
    ],
  },
  {
    id: "usa-states-geographic",
    title: "USA » Bundesstaaten",
    versions: [
      {
        validFrom: "2019-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html",
            label: "© U.S. Census Bureau",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              isoCode: "ISO-Code",
            },
            projection: "albersUsa",
          },
          entities: require("./basemaps/usa-states-geographic.js"),
        },
      },
    ],
  },
  {
    id: "world-countries-geographic",
    title: "Welt » Länder",
    versions: [
      {
        validFrom: "2022-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.naturalearthdata.com/",
            label: "© Natural Earth",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              iso3: "ISO-Code",
            },
            projection: "robinson",
          },
          entities: require("./basemaps/world-countries-geographic.js"),
        },
      },
    ],
  },
  {
    id: "europe-countries-geographic",
    title: "Europa » Länder",
    versions: [
      {
        validFrom: "2022-01-01T00:00:00.000Z",
        data: {
          source: {
            url: "https://www.naturalearthdata.com/",
            label: "© Natural Earth",
          },
          config: {
            defaultEntityType: "name",
            entityTypes: {
              name: "Name",
              iso2: "ISO-Code 2",
              iso3: "ISO-Code 3",
            },
            projection: "d3.geoIdentity",
          },
          entities: require("./basemaps/europe-countries-geographic.js"),
        },
      },
    ],
  },
];
