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
const formatDefaultDecimalGrouping = formatLocale.format(",.1f");
const formatNoGrouping = formatLocale.format("");

function getFormatedValue(formattingOptions, value) {
  if (value === null) {
    return value;
  }

  // if we have a divisor, we round values to float number with one position after comma
  if (formattingOptions.hasDivisor) {
    return formatDefaultDecimalGrouping(value);
  }

  // if we have no divisor but float values in data set we extend all float values
  // to max number of positions after comma
  if (formattingOptions.maxDigitsAfterComma) {
    return formatLocale.format(`,.${formattingOptions.maxDigitsAfterComma}f`)(
      value
    );
  }

  // all other numbers will be formatted following NZZ style guide, i.e. adding
  // thousands gap for numbers >= 10 000
  if (value >= Math.pow(10, 4)) {
    return formatGrouping(value);
  } else {
    return formatNoGrouping(value);
  }
}

module.exports = {
  getFormatedValue,
};
