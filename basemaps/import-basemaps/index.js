const path = require("path");
const insert = require("./db.js").insert;
const get = require("./db.js").get;
const glob = require("glob");
const basemaps = glob.sync(
  `${__dirname}/../prepare-basemaps/02-final-basemaps/data/*.json`
);
const fetch = require("node-fetch");
const FormData = require("form-data");
const promptly = require("promptly");

async function getAccessToken() {
  try {
    const password = await promptly.password("Enter your password: ", {
      replace: "*",
    });

    const response = await fetch(
      `${process.env.Q_SERVER_BASE_URL}/authenticate`,
      {
        method: "POST",
        body: JSON.stringify({
          username: process.env.USERNAME,
          password: password.trim(),
        }),
      }
    );
    if (response.ok) {
      const body = await response.json();
      return {
        accessToken: `Bearer ${body.access_token}`,
        cookie: response.headers.get("set-cookie"),
      };
    } else {
      throw new Error(
        `Error occured while authenticating: (${response.status}) ${response.statusText}`
      );
    }
  } catch (error) {
    console.log(error);
  }
}

async function uploadBasemapData(id, basemap, accessToken) {
  try {
    const form = new FormData();
    form.append("file", JSON.stringify(basemap), {
      filename: `${id}.json`,
      contentType: "application/json",
    });
    const formHeaders = form.getHeaders();

    const response = await fetch(`${process.env.Q_SERVER_BASE_URL}/file`, {
      method: "POST",
      body: form,
      headers: {
        ...formHeaders,
        Authorization: accessToken.accessToken,
        Cookie: accessToken.cookie,
      },
    });
    if (response.ok) {
      const json = await response.json();
      return json.url;
    } else {
      throw Error(response);
    }
  } catch (error) {
    console.log(error);
  }
}

async function saveBasemap(basemapName, basemap) {
  try {
    const response = await get(basemapName);
    if (response.docs.length === 0) {
      return await insert(basemap);
    } else {
      const doc = response.docs.pop();
      basemap._rev = doc._rev;
      return await insert(basemap);
    }
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      for (let basemapPath of basemaps) {
        const basemap = require(basemapPath);
        const basemapName = path.basename(basemapPath, ".json");
        for (let version of basemap.versions) {
          const id = `${basemapName}-${version.validFrom}`;
          const basemapUrl = await uploadBasemapData(
            id,
            version.data,
            accessToken
          );
          version.data = basemapUrl;
        }
        basemap._id = basemapName;
        const response = await saveBasemap(basemapName, basemap);
        if (response.status === "success") {
          console.log(`Successfully stored ${basemapName}`);
        } else {
          throw new Error(
            `${basemapName} couldn't be saved: ${JSON.stringify(response)}`
          );
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

main();
