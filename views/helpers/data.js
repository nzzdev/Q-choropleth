const d3 = {
  format: require("d3-format"),
};

const fourPerEmSpace = "\u2005";
const enDash = "\u2013";

const formatLocale = d3.format.formatLocale({
  decimal: ",",
  thousands: fourPerEmSpace,
  minus: enDash,
  grouping: [3],
});

const formatGrouping = formatLocale.format(",");
const formatDecimalGrouping = formatLocale.format(",.1f");
const formatNoGrouping = formatLocale.format("");

function getFormatedValue(hasFloatingNumbers, value) {
  if (value === null) {
    return value;
  }
  if (hasFloatingNumbers) {
    return formatDecimalGrouping(value);
  }
  return formatGrouping(value);
}

module.exports = {
  getFormatedValue,
};
