module.exports = [
  {
    id: "geographicDELandkreise",
    title: "Geographisch Deutschland (Landkreise)",
    versions: [
      {
        validFrom: "2020-01-01T00:00:00.000Z",
        source: {
          url:
            "https://gdz.bkg.bund.de/index.php/default/digitale-geodaten/verwaltungsgebiete/verwaltungsgebiete-1-1-000-000-ebenen-stand-01-01-vg1000-ebenen-01-01.html",
          label: "© GeoBasis-DE / BKG 2020",
        },
        data: {
          config: {
            defaultEntityType: "ags",
            entityTypes: { ags: "AGS", nuts: "NUTS" },
          },
          entities: require("./geographicDELandkreise.js"),
        },
      },
    ],
  },
  {
    id: "hexagonCHCantons",
    title: "Hexagon Schweiz (Kantone)",
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
];
