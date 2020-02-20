function getChoroplethType(data) {
  if (data.length > 0) {
    // we do not support more than two columns, TODO: remove that later
    if (data[0].length > 2) {
      return "qualitative";
    } else {
      for (let i = 0; i < data.length; i++) {
        if (i !== 0 && data[i].length > 1 && isNaN(data[i][1])) {
          return "qualitative";
        }
      }
    }
  }
  return "quantitative";
}

function getValues(data) {
  return data.map(row => {
    if (row[1] !== null) {
      return parseFloat(row[1]);
    }
    return row[1];
  });
}

module.exports = {
  getChoroplethType,
  getValues
};
