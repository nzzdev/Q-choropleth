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
});

lab.experiment("legend", () => {
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

  // it("shows equal buckets", async () => {
  //   const response = await server.inject({
  //     url: "/rendering-info/web?_id=someid",
  //     method: "POST",
  //     payload: {
  //       item: require("../resources/fixtures/data/hexagon-equal.json"),
  //       toolRuntimeConfig: {
  //         size: {
  //           width: [
  //             {
  //               comparison: "=",
  //               value: 272,
  //             },
  //           ],
  //         },
  //       },
  //     },
  //   });

  //   return elementCount(
  //     response.result.markup,
  //     ".q-choropleth-legend-bucket"
  //   ).then((value) => {
  //     expect(value).to.be.equal(3);
  //   });
  // });

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
