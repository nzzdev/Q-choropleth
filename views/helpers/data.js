function getFormatedValue(value, hasFloatingNumbers) {
  if (hasFloatingNumbers) {
    if (value.toString().indexOf(".") === -1) {
      value += ",0";
    } else {
      value = value.toString().replace(".", ",");
    }
  }
  return value;
}

module.exports = {
  getFormatedValue,
};
