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

async function getBasemap(id, validFrom, isMobile = false) {
  try {
    const retVal = {};
    const document = await this.server.methods.getDocument(id);
    let version = document.versions.find(
      (versionItem) =>
        new Date(versionItem.validFrom).getTime() ===
        new Date(validFrom).getTime()
    );

    // return the newest available version if version is not defined
    if (version === undefined) {
      version = document.versions.shift();
    }

    if (!isMobile || !version.mobile) {
      retVal.data = await fetchJSON(version.data);
    } else {
      retVal.mobile = [];
      retVal.data = await fetchJSON(version.mobile.shift().data);
      for (const baseMap of version.mobile) {
        retVal.mobile.push({ data: await fetchJSON(baseMap.data) });
      }
    }
    
    if (version.miniMaps) {
      retVal.miniMaps = [];
      for (const miniMap of version.miniMaps) {
        if (!isMobile && miniMap.type === "contentWidth" || isMobile && miniMap.type === "mobile") {
          let miniMapCopy = { ...miniMap };
          miniMapCopy.data = await fetchJSON(miniMap.data);
          retVal.miniMaps.push(miniMapCopy);
        }
      }
    }

    return retVal;
  } catch (error) {
    return undefined;
  }
}

async function fetchJSON(url) {
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
