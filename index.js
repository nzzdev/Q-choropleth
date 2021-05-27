const Hapi = require("@hapi/hapi");
const Joi = require("joi");
const baseMapHelpers = require("./helpers/baseMap.js");

const serverMethodCacheOptions = {
  expiresIn: 7 * 24 * 60 * 60 * 1000,
  cache: "memoryCache",
  generateTimeout: 2 * 1000,
};

const server = Hapi.server({
  port: process.env.PORT || 3000,
  routes: {
    cors: true,
  },
});

const routes = require("./routes/routes.js");

async function init() {
  try {
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
    await server.register(require("@hapi/inert"));
    server.validator(Joi);
    server.route(routes);

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

    await server.start();
    console.log("server running ", server.info.uri);
  } catch (error) {
    console.log(error);
  }
}

async function gracefullyStop() {
  console.log("stopping hapi server");
  try {
    await server.stop({ timeout: 10000 });
    console.log("hapi server stopped");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
  process.exit(0);
}

// listen on SIGINT and SIGTERM signal and gracefully stop the server
process.on("SIGINT", gracefullyStop);
process.on("SIGTERM", gracefullyStop);

init();
