const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
const lab = (exports.lab = Lab.script());
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

const routes = require("../routes/routes.js");
let server;

before(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
      routes: {
        cors: true,
      },
    });
    server.validator(Joi);
    server.route(routes);
  } catch (err) {
    expect(err).to.not.exist();
  }
});

after(async () => {
  await server.stop({ timeout: 2000 });
  server = null;
});

function element(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelector(selector));
  });
}

function elements(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector));
  });
}

function elementCount(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}

lab.experiment("categories", () => {
  it("shows a numeric map", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-kmeans.json"),
        toolRuntimeConfig: {
          size: {
            width: [
              {
                comparison: "=",
                value: 272,
              },
            ],
          },
        },
      },
    });

    return elementCount(
      response.result.markup,
      ".q-choropleth-legend-container"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  });

  it("shows a categoric map", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-categorical-map.json"),
        toolRuntimeConfig: {
          size: {
            width: [
              {
                comparison: "=",
                value: 272,
              },
            ],
          },
        },
      },
    });

    return elementCount(response.result.markup, ".s-legend-icon-label").then(
      (value) => {
        expect(value).to.be.equal(1);
      }
    );
  });
});
