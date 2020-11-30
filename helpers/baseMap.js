const Boom = require("@hapi/boom");
const fetch = require("node-fetch");
const db = require("./db.js");

async function getGeodataEntry(id) {
  try {
    const result = await db.get(id);
    const geodataEntry = result.docs.pop();
    if (geodataEntry) {
      return geodataEntry;
    } else {
      return Boom.notFound();
    }
  } catch (error) {
    return Boom.notFound();
  }
}

async function getBasemap(id, validFrom) {
  try {
    const geodataEntry = await getGeodataEntry(id);
    const version = geodataEntry.versions.find(
      (versionItem) =>
        new Date(versionItem.validFrom).getTime() ===
        new Date(validFrom).getTime()
    );
    if (version) {
      if (id.includes("geographic")) {
        const response = await fetch(version.format.geojson);
        if (response.ok) {
          return await response.json();
        } else {
          return Boom.notFound();
        }
      } else if (id.includes("hexagon")) {
        return version.data;
      }
    }
  } catch (error) {
    return Boom.notFound();
  }
}

function getEntityMapping(entityCollection, baseMap, entityType) {
  if (baseMap === "hexagonCHCantons") {
    const cantons = entityCollection.cantons;
    if (entityType === "name") {
      return new Map(cantons.map(({ code, name }) => [code, name]));
    } else if (entityType === "bfsNumber") {
      return new Map(cantons.map(({ code, id }) => [code, id]));
    }
  }
  return undefined;
}

async function getEntityCollectionInfo(request, item) {
  const baseMapEntityCollection = await request.server.methods.getBasemap(
    item.baseMap,
    item.version
  );

  if (baseMapEntityCollection) {
    if (baseMapEntityCollection.type === "Geometry") {
      return {
        config: baseMapEntityCollection.config,
        entityMapping: getEntityMapping(
          baseMapEntityCollection,
          item.baseMap,
          item.entityType
        ),
      };
    } else if (baseMapEntityCollection.type === "Geographic") {
      return baseMapEntityCollection;
    }
  }
  return undefined;
}

module.exports = { getEntityCollectionInfo, getGeodataEntry, getBasemap };
