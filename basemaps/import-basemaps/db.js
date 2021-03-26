const nano = require("nano");
let nanoConfig = {};

if (process.env.COUCHDB) {
  const couchdbConfig = JSON.parse(process.env.COUCHDB);
  nanoConfig = {
    url: `https://${couchdbConfig.host}/${couchdbConfig.database}/`,
    requestDefaults: {
      auth: {
        user: couchdbConfig.username,
        pass: couchdbConfig.password,
      },
    },
  };
}
const db = nano(nanoConfig);

async function get(id) {
  return await db.find({
    selector: {
      _id: { $eq: id },
    },
  });
}

async function insert(doc) {
  const response = await db.insert(doc);
  if (response.ok) {
    return {
      status: "success",
    };
  } else {
    new Error("Not able to save");
  }
}

module.exports = {
  get: get,
  insert: insert,
};
