const nano = require("nano");
let nanoConfig = {};

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
}
const db = nano(nanoConfig);

async function get(id) {
  return await db.find({
    selector: {
      id: { $eq: id },
    },
  });
}

module.exports = {
  get: get,
};
