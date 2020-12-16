const nano = require("nano");
let nanoConfig = {};
let db;

if (process.env.COUCHDB) {
  const couchdbConfig = JSON.parse(process.env.COUCHDB);
  nanoConfig = {
    url: `https://${couchdbConfig.host}/${couchdbConfig.database}/`,
    requestDefaults: {
      auth: {
        user: couchdbConfig.user,
        pass: couchdbConfig.pass,
      },
    },
  };
  db = nano(nanoConfig);
}

if (process.env.NODE_ENV === "test") {
  const basemaps = require("../test/basemaps.json");
  db = {
    list: () => {
      return {
        rows: basemaps.map((basemap) => {
          return { doc: basemap };
        }),
      };
    },
    get: (id) => {
      return basemaps.find((basemap) => basemap._id === id);
    },
  };
}

module.exports = db;
