const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const Joi = require("joi");
const lab = (exports.lab = Lab.script());
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const baseMapHelpers = require("../helpers/baseMap.js");

const serverMethodCacheOptions = {
  expiresIn: 7 * 24 * 60 * 60 * 1000,
  cache: "memoryCache",
  generateTimeout: 2 * 1000,
};

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
    });

    server.cache.provision({
      provider: {
        constructor: require("@hapi/catbox-memory"),
        options: {
          partition: "memoryCache",
          maxByteSize: process.env.MEMORY_CACHE_SIZE || 1000000000, // ~ 1GB
        },
      },
      name: "memoryCache",
    });

    server.method("getAllDocuments", baseMapHelpers.getAllDocuments, {
      cache: serverMethodCacheOptions,
    });

    server.method("getDocument", baseMapHelpers.getDocument, {
      cache: serverMethodCacheOptions,
    });

    server.method("getBasemap", baseMapHelpers.getBasemap, {
      bind: {
        server: server,
      },
      cache: serverMethodCacheOptions,
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

function formatValue(value) {
  return value.replace(/\n| /g, "");
}

function getAnnotationPoints(markup) {
  const annotationPointsAsObjects = [];
  const dom = new JSDOM(markup);

  const annotationPoints = dom.window.document.querySelectorAll(
    ".q-choropleth-annotations circle"
  );
  annotationPoints.forEach((ap) => {
    annotationPointsAsObjects.push({
      cx: ap.getAttribute("cx"),
      cy: ap.getAttribute("cy"),
    });
  });
  return annotationPointsAsObjects;
}

function getAnnotationLines(markup) {
  const annotationLinesAsObjects = [];
  const dom = new JSDOM(markup);
  const annotationLines = dom.window.document.querySelectorAll(
    ".q-choropleth-annotations line"
  );
  annotationLines.forEach((al) => {
    annotationLinesAsObjects.push({
      x1: al.getAttribute("x1"),
      y1: al.getAttribute("y1"),
      x2: al.getAttribute("x2"),
      y2: al.getAttribute("y2"),
    });
  });
  return annotationLinesAsObjects;
}

lab.experiment("options", () => {
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

  it("hides descriptions on map", async () => {
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

    return elementCount(
      response.result.markup,
      ".q-choropleth-hexagon-value"
    ).then((value) => {
      expect(value).to.be.equal(0);
    });
  });

  it("hides values on map", async () => {
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
      ".q-choropleth-hexagon-value"
    ).then((value) => {
      expect(value).to.be.equal(0);
    });
  });

  it("shows average-marker in legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-convert.json"),
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

    return element(response.result.markup, ".q-choropleth-legend-marker").then(
      (element) => {
        expect(element.innerHTML.includes("10,2")).to.be.true();
      }
    );
  });

  it("shows median-marker in legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-median.json"),
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

    return element(response.result.markup, ".q-choropleth-legend-marker").then(
      (element) => {
        expect(formatValue(element.innerHTML)).to.be.equal("Median:10,0");
      }
    );
  });

  it("hides marker in legend", async () => {
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
      ".q-choropleth-legend-marker"
    ).then((value) => {
      expect(value).to.be.equal(0);
    });
  });

  it("shows 'no data' in legend", async () => {
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
      ".q-choropleth-legend-info--no-data"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  });

  it("orders categories in legend by custom order", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-categorical-map-legend-custom-order.json"),
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

    return elements(
      response.result.markup,
      ".s-legend-item-label__item__label"
    ).then((elements) => {
      expect([
        elements[0].innerHTML,
        elements[1].innerHTML,
        elements[2].innerHTML,
        elements[3].innerHTML,
        elements[4].innerHTML,
      ]).to.be.equal([
        "niedriger Wert",
        "mittlerer Wert",
        "hoher Wert",
        "sehr hoher Wert",
        "Keine Daten",
      ]);
    });
  });

  it("orders categories in legend by default order", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-categorical-map-legend-default-order.json"),
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

    return elements(
      response.result.markup,
      ".s-legend-item-label__item__label"
    ).then((elements) => {
      expect([
        elements[0].innerHTML,
        elements[1].innerHTML,
        elements[2].innerHTML,
        elements[3].innerHTML,
        elements[4].innerHTML,
      ]).to.be.equal([
        "sehr hoher Wert",
        "niedriger Wert",
        "hoher Wert",
        "mittlerer Wert",
        "Keine Daten",
      ]);
    });
  });
});

lab.experiment("buckets", () => {
  it("shows custom buckets", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-custom.json"),
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
      ".q-choropleth-legend-bucket"
    ).then((value) => {
      expect(value).to.be.equal(3);
    });
  });

  it("shows custom description", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-custom.json"),
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

    return element(
      response.result.markup,
      ".q-choropleth-methods-description"
    ).then((element) => {
      expect(element.innerHTML).to.be.equal(
        "Die Gruppen wurden manuell definiert."
      );
    });
  });

  it("shows jenks buckets", async () => {
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

    let legendData = [];
    const dom = new JSDOM(response.result.markup);
    const legendDescription = dom.window.document.querySelectorAll(
      ".q-choropleth-methods-legend-table tr"
    );
    legendDescription.forEach((row) => {
      let min = row.querySelectorAll("td")[1].innerHTML.replace(",", ".");
      let max = row.querySelectorAll("td")[3].innerHTML.replace(",", ".");
      legendData.push([formatValue(min), formatValue(max)]);
    });

    expect(legendData).to.be.equal([
      ["100", "200"],
      ["200", "400"],
      ["400", "600"],
      ["600", "800"],
      ["800", "900"],
    ]);
  });

  it("shows jenks description", async () => {
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

    return element(
      response.result.markup,
      ".q-choropleth-methods-description"
    ).then((element) => {
      expect(element.innerHTML).to.be.equal(
        "Die unterschiedlich grossen Gruppen kommen durch ein statistisches Verfahren zustande, welches die Werte so in Gruppen einteilt, dass die Unterschiede zwischen den Regionen möglichst gut sichtbar werden (Jenks Natural Breaks)."
      );
    });
  });

  it("shows quantile buckets", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-quantile.json"),
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

    let legendData = [];
    const dom = new JSDOM(response.result.markup);
    const legendDescription = dom.window.document.querySelectorAll(
      ".q-choropleth-methods-legend-table tr"
    );
    legendDescription.forEach((row) => {
      let min = row.querySelectorAll("td")[1].innerHTML.replace(",", ".");
      let max = row.querySelectorAll("td")[3].innerHTML.replace(",", ".");
      legendData.push([formatValue(min), formatValue(max)]);
    });

    expect(legendData).to.be.equal([
      ["100", "120"],
      ["120", "400"],
      ["400", "500"],
      ["500", "900"],
    ]);
  });

  it("shows quantile description", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-quantile.json"),
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

    return element(
      response.result.markup,
      ".q-choropleth-methods-description"
    ).then((element) => {
      expect(element.innerHTML).to.be.equal(
        "Die Gruppen wurden so gewählt, dass in jeder Gruppe möglichst gleich viele Werte vorhanden sind."
      );
    });
  });

  it("shows equal buckets", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-equal.json"),
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

    let legendData = [];
    const dom = new JSDOM(response.result.markup);
    const legendDescription = dom.window.document.querySelectorAll(
      ".q-choropleth-methods-legend-table tr"
    );
    legendDescription.forEach((row) => {
      let min = row.querySelectorAll("td")[1].innerHTML.replace(",", ".");
      let max = row.querySelectorAll("td")[3].innerHTML.replace(",", ".");
      legendData.push([formatValue(min), formatValue(max)]);
    });

    expect(legendData).to.be.equal([
      ["100", "260"],
      ["260", "420"],
      ["420", "580"],
      ["580", "740"],
      ["740", "900"],
    ]);
  });

  it("shows equal description", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-equal.json"),
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

    return element(
      response.result.markup,
      ".q-choropleth-methods-description"
    ).then((element) => {
      expect(element.innerHTML).to.be.equal(
        "Die Gruppen wurden so gewählt, dass sie jeweils einen gleich grossen Bereich auf der Skala abdecken."
      );
    });
  });
});

lab.experiment("converting numbers", () => {
  it("divior in subtitle", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-convert.json"),
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

    return element(response.result.markup, ".s-q-item__subtitle").then(
      (element) => {
        expect(element.innerHTML.includes("in Tausend")).to.be.true();
      }
    );
  });

  it("converts legend-values", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-convert.json"),
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

    const dom = new JSDOM(response.result.markup);
    const minVal = dom.window.document.querySelector(
      ".q-choropleth-legend-value-container--minVal"
    );
    const maxVal = dom.window.document.querySelector(
      ".q-choropleth-legend-value-container--maxVal"
    );

    expect([
      formatValue(minVal.innerHTML),
      formatValue(maxVal.innerHTML),
    ]).to.be.equals(["10,0", "12,0"]);
  });

  it("converts legend-marker", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-convert.json"),
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

    return element(response.result.markup, ".q-choropleth-legend-marker").then(
      (element) => {
        expect(element.innerHTML.includes("10,2")).to.be.true();
      }
    );
  });

  it("converts hexagon-values", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-convert.json"),
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

    return elements(response.result.markup, ".q-choropleth-hexagon-value").then(
      (elements) => {
        expect(formatValue(elements[0].innerHTML)).to.be.equal("10,0");
      }
    );
  });
});

lab.experiment("single bucket", () => {
  it("shows single bucket in legend", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-kmeans-single-value-bucket.json"),
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
      ".q-choropleth-legend-info--single-bucket"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  });

  it("shows single bucket in footer", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-kmeans-single-value-bucket.json"),
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

    return elements(
      response.result.markup,
      ".q-choropleth-methods-legend-table tr"
    ).then((elements) => {
      expect(elements[0].querySelectorAll("td")[4].innerHTML).to.be.equal(
        "(nur ein Datenpunkt)"
      );
    });
  });
});

lab.experiment("annotations", () => {
  it("shows annotations on map (geographic)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/geographic-categorical-show-annotations.json"),
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
      ".s-q-item__annotation-legend__item"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  });

  it("shows annotations on map (hexagon)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-categorical-show-annotations.json"),
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
      ".s-q-item__annotation-legend__item"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  });

  it("shows annotations in legend (geographic)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/geographic-categorical-show-annotations.json"),
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
      ".s-q-item__annotation-legend__item"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  });

  it("shows annotations in legend (hexagon)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-categorical-show-annotations.json"),
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
      ".s-q-item__annotation-legend__item"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  });

  it("annotations on narrow map have correct coordinates (geographic)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/geographic-categorical-show-annotations.json"),
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

    expect(getAnnotationPoints(response.result.markup)).to.be.equal([
      { cx: "123.06", cy: "-16" },
      { cx: "28.01", cy: "-16" },
      { cx: "223.46", cy: "385.42" },
      { cx: "63.77", cy: "385.42" },
      { cx: "168.48", cy: "385.42" },
    ]);
    expect(getAnnotationLines(response.result.markup)).to.be.equal([
      { x1: "123.06", y1: "-16", x2: "123.06", y2: "76.73" },
      { x1: "28.01", y1: "-16", x2: "28.01", y2: "189.17" },
      { x1: "223.46", y1: "385.42", x2: "223.46", y2: "128.32" },
      { x1: "63.77", y1: "385.42", x2: "63.77", y2: "318.56" },
      { x1: "168.48", y1: "385.42", x2: "168.48", y2: "330.54" },
    ]);
  });

  it("annotations on narrow map have correct coordinates (hexagon)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-categorical-show-annotations.json"),
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

    expect(getAnnotationPoints(response.result.markup)).to.be.equal([
      { cx: "172.27", cy: "-16" },
      { cx: "81.6", cy: "-16" },
      { cx: "244.8", cy: "183.51" },
      { cx: "154.13", cy: "183.51" },
      { cx: "99.73", cy: "183.51" },
    ]);
    expect(getAnnotationLines(response.result.markup)).to.be.equal([
      { x1: "172.27", y1: "-16", x2: "172.27", y2: "36.64" },
      { x1: "81.6", y1: "-16", x2: "81.6", y2: "68.05" },
      { x1: "244.8", y1: "183.51", x2: "244.8", y2: "99.46" },
      { x1: "154.13", y1: "183.51", x2: "154.13", y2: "130.87" },
      { x1: "99.73", y1: "183.51", x2: "99.73", y2: "162.27" },
    ]);
  });

  it("annotations on wide map have correct coordinates (geographic)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/geographic-categorical-show-annotations.json"),
        toolRuntimeConfig: {
          size: {
            width: [
              {
                comparison: "=",
                value: 472,
              },
            ],
          },
        },
      },
    });

    expect(getAnnotationPoints(response.result.markup)).to.be.equal([
      { cx: "183.21", cy: "-16" },
      { cx: "-16", cy: "281.64" },
      { cx: "420.96", cy: "191.05" },
      { cx: "94.94", cy: "566" },
      { cx: "250.84", cy: "566" },
    ]);
    expect(getAnnotationLines(response.result.markup)).to.be.equal([
      { x1: "183.21", y1: "-16", x2: "183.21", y2: "114.23" },
      { x1: "-16", y1: "281.64", x2: "41.71", y2: "281.64" },
      { x1: "332.69", y1: "191.05", x2: "420.96", y2: "191.05" },
      { x1: "94.94", y1: "566", x2: "94.94", y2: "474.28" },
      { x1: "250.84", y1: "566", x2: "250.84", y2: "492.11" },
    ]);
  });

  it("annotations on wide map have correct coordinates (hexagon)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-categorical-show-annotations.json"),
        toolRuntimeConfig: {
          size: {
            width: [
              {
                comparison: "=",
                value: 472,
              },
            ],
          },
        },
      },
    });

    expect(getAnnotationPoints(response.result.markup)).to.be.equal([
      { cx: "267.27", cy: "-16" },
      { cx: "-16", cy: "113.7" },
      { cx: "438", cy: "113.7" },
      { cx: "239.13", cy: "275.88" },
      { cx: "154.73", cy: "275.88" },
    ]);
    expect(getAnnotationLines(response.result.markup)).to.be.equal([
      { x1: "267.27", y1: "-16", x2: "267.27", y2: "56.85" },
      { x1: "-16", y1: "113.7", x2: "112.53", y2: "113.7" },
      { x1: "393.87", y1: "113.7", x2: "438", y2: "113.7" },
      { x1: "239.13", y1: "275.88", x2: "239.13", y2: "203.03" },
      { x1: "154.73", y1: "275.88", x2: "154.73", y2: "251.76" },
    ]);
  });
});
