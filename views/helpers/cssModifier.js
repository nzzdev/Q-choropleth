export function getCssModifier(contentWidth) {
  if (contentWidth < 400) {
    return "narrow";
  } else if (contentWidth < 470) {
    return "wide";
  } else if (contentWidth < 650) {
    return "wide-plus";
  } else {
    return "extra-wide";
  }
}
