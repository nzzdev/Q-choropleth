module.exports = [
  require("./rendering-info/web.js"),
  require("./stylesheet.js"),
  //  require("./script.js"),
  require("./health.js"),
  require("./fixtures/data.js"),
  require("./locales.js"),
  require("./option-availability.js"),
  require("./dynamic-schema.js")
].concat(require("./schema.js"));
