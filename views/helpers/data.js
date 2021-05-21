import { formatLocale } from "d3-format";

const fourPerEmSpace = "\u2005";
const enDash = "\u2013";

const formatLocaleLarge = formatLocale({
  decimal: ",",
  thousands: fourPerEmSpace,
  minus: enDash,
  grouping: [3],
});

const formatLocaleSmall = formatLocale({
  decimal: ",",
  minus: enDash,
});

export function getFormattedValueForBuckets(formattingOptions, value) {
  if (formattingOptions.roundingBucketBorders) {
    return getFormattedValue(formattingOptions, value);
  }
  return getFormattedValue({}, value);
}

export function getFormattedValue(formattingOptions, value) {
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
    return formatLocaleLarge.format(formatSpecifier)(value);
  } else {
    return formatLocaleSmall.format(formatSpecifier)(value);
  }
}

export function round(number) {
  return Math.round(number * 100) / 100;
}
