const path = require("path");
const insert = require("./db.js").insert;
const get = require("./db.js").get;
const glob = require("glob");
const fetch = require("node-fetch");
const FormData = require("form-data");
const promptly = require("promptly");
const basemapsPath = "../prepare-basemaps/final-basemaps";
const basemaps = glob.sync(`./${basemapsPath}/*.json`);

async function getBearerToken() {
  if (!process.env.Q_SERVER_AUTH) {
    const password = await promptly.password(
      "Enter your livingdocs password: ",
      {
        replace: "*",
      }
    );

    const response = await fetch(
      `${process.env.Q_SERVER_BASE_URL}/authenticate`,
      {
        method: "POST",
        body: JSON.stringify({
          username: process.env.LD_USERNAME,
          password: password.trim(),
        }),
      }
    );
    if (response.ok) {
      const body = await response.json();
      return `Bearer ${body.access_token}`;
    } else {
      throw new Error(
        `Error occured while authenticating: (${response.status}) ${response.statusText}`
      );
    }
  } else {
    return `Bearer ${process.env.Q_SERVER_AUTH}`;
  }
}

async function uploadBasemapData(id, basemap, bearer) {
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
        Authorization: bearer,
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
    const bearer = await getBearerToken();
    for (let basemapPath of basemaps) {
      const basemap = require(basemapPath);
      const basemapName = path.basename(basemapPath, ".json");
      for (let version of basemap.versions) {
        const id = `${basemapName}-${version.validFrom}`;
        const basemapUrl = await uploadBasemapData(id, version.data, bearer);
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
  } catch (error) {
    console.log(error);
  }
}

main();
