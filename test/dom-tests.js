const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
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
      routes: {
        cors: true,
      },
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

    return elements(response.result.markup, ".s-legend-item-label__item__label").then((elements) => {
      expect([
        elements[0].innerHTML,
        elements[1].innerHTML,
        elements[2].innerHTML,
        elements[3].innerHTML,
        elements[4].innerHTML
      ]).to.be.equal([
        "niedriger Wert",
        "mittlerer Wert",
        "hoher Wert",
        "sehr hoher Wert",
        "Keine Daten"
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

    return elements(response.result.markup, ".s-legend-item-label__item__label").then((elements) => {
      expect([
        elements[0].innerHTML,
        elements[1].innerHTML,
        elements[2].innerHTML,
        elements[3].innerHTML,
        elements[4].innerHTML
      ]).to.be.equal([
        "sehr hoher Wert",
        "niedriger Wert",
        "hoher Wert",
        "mittlerer Wert",
        "Keine Daten"
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
        item: require("../resources/fixtures/data/geographic-show-annotations.json"),
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
      ".q-choropleth-annotation"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  });

  it("shows annotations on map (hexagon)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-show-annotations.json"),
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
      ".q-choropleth-annotation"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  });

  it("shows annotations in legend (geographic)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/geographic-show-annotations.json"),
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
      ".q-choropleth-legend-annotation"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  });

  it("shows annotations in legend (hexagon)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-show-annotations.json"),
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
      ".q-choropleth-legend-annotation"
    ).then((value) => {
      expect(value).to.be.equal(5);
    });
  });

  it("annotations on narrow map have correct coordinates (geographic)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/geographic-show-annotations.json"),
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
    const annotationPoints = dom.window.document.querySelectorAll(".q-choropleth-annotation g");
    const annotationLines = dom.window.document.querySelectorAll(".q-choropleth-annotation line");
    const annotationPointsAsObjects = [];
    const annotationLinesAsObjects = [];

    annotationPoints.forEach(ap => {
      annotationPointsAsObjects.push({
        transform: ap.getAttribute("transform"),
      })
    });

    annotationLines.forEach(al => {
      annotationLinesAsObjects.push({
        x1: al.getAttribute("x1"),
        y1: al.getAttribute("y1"),
        x2: al.getAttribute("x2"),
        y2: al.getAttribute("y2")
      })
    });

    expect(annotationPointsAsObjects).to.be.equal([
      { transform: 'translate(123.06, -16)'    },
      { transform: 'translate(28.01, -16)'     },
      { transform: 'translate(223.46, 385.42)' },
      { transform: 'translate(63.77, 385.42)'  },
      { transform: 'translate(168.48, 385.42)' }
    ]);
    expect(annotationLinesAsObjects).to.be.equal([
      { x1: '123.06', y1: '-7',     x2: '123.06', y2: '76.73'  },
      { x1: '28.01',  y1: '-7',     x2: '28.01',  y2: '189.17' },
      { x1: '223.46', y1: '376.42', x2: '223.46', y2: '128.32' },
      { x1: '63.77',  y1: '376.42', x2: '63.77',  y2: '318.56' },
      { x1: '168.48', y1: '376.42', x2: '168.48', y2: '330.54' }
    ]);
  });

  it("annotations on narrow map have correct coordinates (hexagon)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-show-annotations.json"),
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
    const annotationPoints = dom.window.document.querySelectorAll(".q-choropleth-annotation g");
    const annotationLines = dom.window.document.querySelectorAll(".q-choropleth-annotation line");
    const annotationPointsAsObjects = [];
    const annotationLinesAsObjects = [];

    annotationPoints.forEach(ap => {
      annotationPointsAsObjects.push({
        transform: ap.getAttribute("transform"),
      })
    });

    annotationLines.forEach(al => {
      annotationLinesAsObjects.push({
        x1: al.getAttribute("x1"),
        y1: al.getAttribute("y1"),
        x2: al.getAttribute("x2"),
        y2: al.getAttribute("y2")
      })
    });

    expect(annotationPointsAsObjects).to.be.equal([
      { transform: 'translate(47.5, -4)'    },
      { transform: 'translate(22.5, -4)'    },
      { transform: 'translate(67.5, 50.19)' },
      { transform: 'translate(42.5, 50.19)' },
      { transform: 'translate(27.5, 50.19)' }
    ]);
    expect(annotationLinesAsObjects).to.be.equal([
      { x1: '47.5', y1: '-1.75', x2: '47.5', y2: '10.1'  },
      { x1: '22.5', y1: '-1.75', x2: '22.5', y2: '18.76' },
      { x1: '67.5', y1: '47.94', x2: '67.5', y2: '27.42' },
      { x1: '42.5', y1: '47.94', x2: '42.5', y2: '36.08' },
      { x1: '27.5', y1: '47.94', x2: '27.5', y2: '44.74' }
    ]);
  });

  it("annotations on wide map have correct coordinates (geographic)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/geographic-show-annotations.json"),
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

    const dom = new JSDOM(response.result.markup);
    const annotationPoints = dom.window.document.querySelectorAll(".q-choropleth-annotation g");
    const annotationLines = dom.window.document.querySelectorAll(".q-choropleth-annotation line");
    const annotationPointsAsObjects = [];
    const annotationLinesAsObjects = [];

    annotationPoints.forEach(ap => {
      annotationPointsAsObjects.push({
        transform: ap.getAttribute("transform"),
      })
    });

    annotationLines.forEach(al => {
      annotationLinesAsObjects.push({
        x1: al.getAttribute("x1"),
        y1: al.getAttribute("y1"),
        x2: al.getAttribute("x2"),
        y2: al.getAttribute("y2")
      })
    });

    expect(annotationPointsAsObjects).to.be.equal([
      { transform: 'translate(183.21, -16)'    },
      { transform: 'translate(-16, 281.64)'    },
      { transform: 'translate(420.96, 191.05)' },
      { transform: 'translate(94.94, 566)'     },
      { transform: 'translate(250.84, 566)'    }
    ]);
    expect(annotationLinesAsObjects).to.be.equal([
      { x1: '183.21', y1: '-7',     x2: '183.21', y2: '114.23' },
      { x1: '-7',     y1: '281.64', x2: '41.71',  y2: '281.64' },
      { x1: '332.69', y1: '191.05', x2: '411.96', y2: '191.05' },
      { x1: '94.94',  y1: '557',    x2: '94.94',  y2: '474.28' },
      { x1: '250.84', y1: '557',    x2: '250.84', y2: '492.11' }
    ]);
  });

  it("annotations on wide map have correct coordinates (hexagon)", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/hexagon-show-annotations.json"),
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

    const dom = new JSDOM(response.result.markup);
    const annotationPoints = dom.window.document.querySelectorAll(".q-choropleth-annotation g");
    const annotationLines = dom.window.document.querySelectorAll(".q-choropleth-annotation line");
    const annotationPointsAsObjects = [];
    const annotationLinesAsObjects = [];

    annotationPoints.forEach(ap => {
      annotationPointsAsObjects.push({
        transform: ap.getAttribute("transform"),
      })
    });

    annotationLines.forEach(al => {
      annotationLinesAsObjects.push({
        x1: al.getAttribute("x1"),
        y1: al.getAttribute("y1"),
        x2: al.getAttribute("x2"),
        y2: al.getAttribute("y2")
      })
    });

    expect(annotationPointsAsObjects).to.be.equal([
      { transform: 'translate(47.5, -4)'    },
      { transform: 'translate(-4, 20.21)'   },
      { transform: 'translate(79, 20.21)'   },
      { transform: 'translate(42.5, 50.19)' },
      { transform: 'translate(27.5, 50.19)' }
    ]);
    expect(annotationLinesAsObjects).to.be.equal([
      { x1: '47.5',  y1: '-1.75', x2: '47.5',  y2: '10.1'  },
      { x1: '-1.75', y1: '20.21', x2: '20',    y2: '20.21' },
      { x1: '70',    y1: '20.21', x2: '76.75', y2: '20.21' },
      { x1: '42.5',  y1: '47.94', x2: '42.5',  y2: '36.08' },
      { x1: '27.5',  y1: '47.94', x2: '27.5',  y2: '44.74' }
    ]);
  });
});
