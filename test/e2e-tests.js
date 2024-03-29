const fs = require("fs");
const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const Joi = require("joi");
const baseMapHelpers = require("../helpers/baseMap.js");

const serverMethodCacheOptions = {
  expiresIn: 7 * 24 * 60 * 60 * 1000,
  cache: "memoryCache",
  generateTimeout: 2 * 1000,
};

const lab = (exports.lab = Lab.script());

const glob = require("glob");

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

    await server.register(require("@hapi/inert"));
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

lab.experiment("basics", () => {
  it("starts the server", () => {
    expect(server.info.created).to.be.a.number();
  });

  it("is healthy", async () => {
    const response = await server.inject("/health");
    expect(response.payload).to.equal("ok");
  });
});

lab.experiment("schema endpoint", () => {
  it("returns 200 for /schema.json", async () => {
    const response = await server.inject("/schema.json");
    expect(response.statusCode).to.be.equal(200);
  });
});

lab.experiment("locales endpoint", () => {
  it("returns 200 for en translations", async () => {
    const request = {
      method: "GET",
      url: "/locales/en/translation.json",
    };
    const response = await server.inject(request);
    expect(response.statusCode).to.be.equal(200);
  });
  it("returns 200 for fr translations", async () => {
    const request = {
      method: "GET",
      url: "/locales/fr/translation.json",
    };
    const response = await server.inject(request);
    expect(response.statusCode).to.be.equal(200);
  });
  it("returns 200 for de translations", async () => {
    const request = {
      method: "GET",
      url: "/locales/de/translation.json",
    };
    const response = await server.inject(request);
    expect(response.statusCode).to.be.equal(200);
  });
});

lab.experiment("stylesheets endpoint", () => {
  it(
    "returns existing stylesheet with right cache control header",
    { plan: 2 },
    async () => {
      const filename = require("../styles/hashMap.json").default;
      const response = await server.inject(`/stylesheet/${filename}`);
      expect(response.statusCode).to.be.equal(200);
      expect(response.headers["cache-control"]).to.be.equal(
        "max-age=31536000, immutable"
      );
    }
  );

  it("returns Not Found when requesting an inexisting stylesheet", async () => {
    const response = await server.inject("/stylesheet/inexisting.123.css");
    expect(response.statusCode).to.be.equal(404);
  });
});

lab.experiment("fixtures", () => {
  const fixtureFiles = glob.sync(
    `${__dirname}/../resources/fixtures/data/*.json`
  );
  for (let fixtureFile of fixtureFiles) {
    const fixture = require(fixtureFile);
    it(`640px - doesnt fail in rendering fixture ${fixture.title}`, async () => {
      const request = {
        method: "POST",
        url: "/rendering-info/web",
        payload: {
          item: fixture,
          toolRuntimeConfig: {
            size: {
              width: [
                {
                  comparison: "=",
                  value: 640,
                },
              ],
            },
          },
        },
      };
      const response = await server.inject(request);
      expect(response.statusCode).to.be.equal(200);
    });
    it(`272px - doesnt fail in rendering fixture ${fixture.title}`, async () => {
      const request = {
        method: "POST",
        url: "/rendering-info/web",
        payload: {
          item: fixture,
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
      };
      const response = await server.inject(request);
      expect(response.statusCode).to.be.equal(200);
    });
  }
});

lab.experiment("rendering-info", () => {
  it("web: returns error 400 if invalid item is given", async () => {
    const request = {
      method: "POST",
      url: "/rendering-info/web",
      payload: {
        item: {
          some: "object",
          that: "doesn't validate against the schema",
        },
        toolRuntimeConfig: {},
      },
    };
    const response = await server.inject(request);
    expect(response.statusCode).to.be.equal(400);
  });
});

lab.experiment("assets", () => {
  it("returnes stylesheet", async () => {
    const fixture = fs.readFileSync(
      `${__dirname}/../resources/fixtures/data/hexagon-kmeans.json`,
      { encoding: "utf-8" }
    );
    const res = await server.inject({
      url: "/rendering-info/web",
      method: "POST",
      payload: {
        item: JSON.parse(fixture),
        toolRuntimeConfig: {},
      },
    });
    const stylesheetRes = await server.inject(
      `/stylesheet/${res.result.stylesheets[1].name}`
    );
    expect(stylesheetRes.statusCode).to.be.equal(200);
  });

  it("returnes basemap", async () => {
    const fixture = JSON.parse(
      fs.readFileSync(
        `${__dirname}/../resources/fixtures/data/hexagon-kmeans.json`,
        { encoding: "utf-8" }
      )
    );
    const response = await server.inject({
      url: `/basemap/${fixture.baseMap}?version=${fixture.version}`,
      method: "GET",
    });

    expect(response.statusCode).to.be.equal(200);
  });
});
