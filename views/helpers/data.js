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

const formatLocaleSmall = d3.format.formatLocale({
  decimal: ",",
  minus: enDash,
});

function getFormattedValueForBuckets(formattingOptions, value) {
  if (formattingOptions.roundingBucketBorders) {
    return getFormattedValue(formattingOptions, value);
  }
  return getFormattedValue({}, value);
}

function getFormattedValue(formattingOptions, value) {
  if (value === null) {
    return value;
  }

  let formatSpecifier = ",";

  // if we have float values in data set we extend all float values
  // to max number of positions after comma, e.g. format specifier
  // could be ",.2f" for 2 positions after comma
  if (formattingOptions.maxDigitsAfterComma) {
    formatSpecifier = `,.${formattingOptions.maxDigitsAfterComma}f`;
  }

  // if we have number >= 10 000 we add a space after each 3 digits
  if (value >= Math.pow(10, 4)) {
    return formatLocale.format(formatSpecifier)(value);
  } else {
    return formatLocaleSmall.format(formatSpecifier)(value);
  }
}

module.exports = {
  getFormattedValueForBuckets,
  getFormattedValue,
};
