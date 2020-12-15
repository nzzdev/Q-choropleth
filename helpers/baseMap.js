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

async function getBasemap(id, validFrom) {
  try {
    const document = await this.server.methods.getDocument(id);
    let version = document.versions.find(
      (versionItem) =>
        new Date(versionItem.validFrom).getTime() ===
        new Date(validFrom).getTime()
    );

    // return the newest available version if version is not defined
    if (version === undefined) {
      version = document.versions.pop();
    }

    if (version.data && typeof version.data === "object") {
      return version.data;
    } else if (version.data && typeof version.data === "string") {
      const response = await fetch(version.data);
      if (response.ok) {
        return await response.json();
      } else {
        return undefined;
      }
    }
  } catch (error) {
    return undefined;
  }
}

module.exports = { getAllDocuments, getDocument, getBasemap };
