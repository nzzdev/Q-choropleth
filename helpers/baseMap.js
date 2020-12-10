const fetch = require("node-fetch");
const db = require("./db.js");

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
    console.log(error);
    return undefined;
  }
}

async function getBasemap(id, validFrom) {
  try {
    const document = await getDocument(id);
    const version = document.versions.find(
      (versionItem) =>
        new Date(versionItem.validFrom).getTime() ===
        new Date(validFrom).getTime()
    );
    if (version) {
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
    }
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

module.exports = { getDocument, getBasemap };
