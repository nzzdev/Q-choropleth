const Boom = require("@hapi/boom");
const fetch = require("node-fetch");
const db = require("./db.js");

async function getBasemap(id, version) {
  try {
    const result = await db.get(id);
    const geodataEntry = result.docs.pop();
    if (geodataEntry) {
      let geodataUrl;
      if (version >= 0 && geodataEntry.versions[version]) {
        geodataUrl = geodataEntry.versions[version].format.geojson;
      } else {
        const entry = geodataEntry.versions.pop();
        geodataUrl = entry.format.geojson;
      }
      const response = await fetch(geodataUrl);
      if (response.ok) {
        return await response.json();
      } else {
        return Boom.notFound();
      }
    } else {
      return Boom.notFound();
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
  const baseMapEntityCollectionResponse = await request.server.inject({
    method: "GET",
    url: `/entityCollection/${item.baseMap}`,
  });

  if (baseMapEntityCollectionResponse.statusCode === 200) {
    const baseMapEntityCollection = baseMapEntityCollectionResponse.result;
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
      baseMapEntityCollection.entityMapping = getEntityMapping(
        baseMapEntityCollection,
        item.baseMap,
        item.entityType
      );
      return baseMapEntityCollection;
    }
  }
  return undefined;
}

module.exports = { getEntityCollectionInfo, getBasemap };
