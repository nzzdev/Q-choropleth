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

module.exports = { getGeometryMapping };
