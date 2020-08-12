function getGeometryMapping(entityCollection, baseMap, entityType) {
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

async function getEntityMapping(request, item) {
  try {
    const baseMapEntityCollectionResponse = await request.server.inject({
      method: "GET",
      url: `/entityCollection/${item.baseMap}`,
    });

    if (baseMapEntityCollectionResponse.statusCode === 200) {
      const baseMapEntityCollection = baseMapEntityCollectionResponse.result;
      if (baseMapEntityCollection.type === "Geometry") {
        return getGeometryMapping(
          baseMapEntityCollection,
          item.baseMap,
          item.entityType
        );
      }
    }
  } catch (error) {
    // TODO: error handling
  }
  return undefined;
}

module.exports = { getEntityMapping };
