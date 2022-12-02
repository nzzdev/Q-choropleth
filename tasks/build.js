const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const rollup = require("rollup");
const { babel } = require("@rollup/plugin-babel")
const { terser } = require("rollup-plugin-terser");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const svelte = require("rollup-plugin-svelte");
const css = require("rollup-plugin-css-only");

const production = !process.env.npm_config_dev;
const scriptsDir = path.join(__dirname, "/../scripts_src/");

function writeHashmap(hashmapPath, file, fileext) {
  const hash = crypto.createHash("md5");
  hash.update(file.content, { encoding: "utf8" });
  file.hash = hash.digest("hex");

  const hashMap = {};
  hashMap[file.name] = `${file.name}.${file.hash.substring(0, 8)}.${fileext}`;
  fs.writeFileSync(hashmapPath, JSON.stringify(hashMap));
}

async function build() {
  try {
    const filename = "default";
    const inputOptions = {
      input: `${scriptsDir}${filename}.js`,
      plugins: [
        json({ namedExports: false }),
        svelte(),
        css({
          output: function (styles, styleNodes) {
            fs.writeFileSync(`styles/${filename}.css`, styles);
            writeHashmap(
              "styles/hashMap.json",
              {
                name: filename,
                content: styles,
              },
              "css"
            );
          },
        }),
        nodeResolve({ browser: true }),
        commonjs(),
        babel({
          babelHelpers: "bundled",
          extensions: [".js", ".html"],
          exclude: ["node_modules/@babel/**"],
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  ie: "11"
                }
              }
            ]
          ]
        }),
        production && terser(),
      ],
    };
    const outputOptions = {
      format: "iife",
      name: "window._q_choropleth.Choropleth",
      file: `scripts/${filename}.js`,
      sourcemap: false,
    };

    // create the bundle and write it to disk
    const bundle = await rollup.rollup(inputOptions);
    const { output } = await bundle.generate(outputOptions);
    await bundle.write(outputOptions);
    writeHashmap(
      "scripts/hashMap.json",
      {
        name: filename,
        content: output[0].code,
      },
      "js"
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

Promise.all([build()])
  .then((res) => {
    console.log("build complete");
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
