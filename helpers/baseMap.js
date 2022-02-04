const fetch = require("node-fetch");
const db = require("./db.js");

async function getAllDocuments() {
  try {
    const documents = await db.list({ include_docs: true });
    if (documents) {
      return documents.rows;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
}

async function getDocument(id) {
  try {
    const document = await db.get(id);
    if (document) {
      document.versions = document.versions.sort(
        (a, b) =>
          new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
      );
      return document;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
}

async function getBasemap(id, validFrom, isWide = true) {
  try {
    console.log("getBasemap", id, validFrom, isWide);
    const document = await this.server.methods.getDocument(id);
    let version = document.versions.find(
      (versionItem) =>
        new Date(versionItem.validFrom).getTime() ===
        new Date(validFrom).getTime()
    );
    let dataMobile;

    // return the newest available version if version is not defined
    if (version === undefined) {
      version = document.versions.shift();
    }

    if (!isWide) {
      dataMobile = fetchJSON(version.dataMobile);
      if (dataMobile) return dataMobile;
    }

    return fetchJSON(version.data);
  } catch (error) {
    return undefined;
  }
}

async function fetchJSON(url) {
  if (!url) return undefined;
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
}

module.exports = { getAllDocuments, getDocument, getBasemap };
