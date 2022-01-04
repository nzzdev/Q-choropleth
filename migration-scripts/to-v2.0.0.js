module.exports.migrate = function (item) {
  let result = {
    isChanged: false,
  };

  if (item.mapAnnotations !== undefined && item.mapAnnotations.length !== 0) {
    item.mapAnnotations.forEach((annotation) => {
      if (annotation && !annotation.regions) {
        annotation.regions = [annotation.region];
        delete annotation.region;
        result.isChanged = true;
      }
    });
  }

  result.item = item;
  return result;
};
