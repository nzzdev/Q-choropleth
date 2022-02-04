## Choropleth Basemaps

Extracts, tranforms and loads (ETL) choropleth basemaps. This process is separated in two steps:

### Basemaps Configuration

Each basemap has a config file (see `./config/basemaps`) containing instructions for downloading & transforming the given basemap dataset.

Each config file consists of a config object with the following properties:

```js
{
  dataUrl: 'https://www.web.statistik.zh.ch/data/KTZH_151_Gemeinden2019.zip' // URL of dataset to be initially downloaded
  featuresPath:
    "./pathToFeatures/GEN_A4_GEMEINDEN_2019_epsg4326.json", // Path to features of desired geojson (in downloaded dataset)
  waterPath:
    "./pathToWater/GEN_A4_GEMEINDEN_SEEN_2019_epsg4326.json", // (Optional) Path to water sources of desired geojson (in downloaded dataset)
  featuresPropertyMapping: { // Mapping of input features properties to output features properties (properties not listed here are not in the output file)
    id: "BFS",
    name: "NAME"
  },
  rewriteProperties: {  // (Optional) Rewrite features property values (key) to desired value (value) | Note: Properties will be rewritten after (!) features property mapping
    "Graubünden / Grigioni / Grischun": "Graubünden"
  },
  addProperties: [ // (Optional) Add/Overwrite properties to either (1) id matching 'feature' entries or (2) all 'feature' entries of given geojson
    { id: 12, fusionierteGemeinde: true },
    { standDatum: 01-01-2019 }
  ]
}
```

Checkout existing config files on how to apply each property of the config object.

### Prepare Basemaps

The prepare basemaps step is responsible for extracting and transforming the source data.

The basemap configuration file contains all details for each kind of basemap. Each basemap has specific requirements to extracting and transforming. Therefore each basemap provides a `download` and `transform` function. This makes it possible that each basemap can handle these steps according to their specific requirements.

Every step of the prepare basemap process can be run separately. This makes debugging easier:

```js
// downloads the source data of all basemaps
npm run download-basemaps

// generates the basemaps based on the source data
npm run generate-basemaps

// combines versions of each basemap to a single file
npm run final-basemaps

// runs all three steps after each other
npm run prepare-basemaps
```

Optionally its possible to run a step only for a single basemap:

```js
// downloads the source data of all basemaps
npm run download-basemaps --basemap=ch-municipalities-geographic

// generates the basemaps based on the source data
npm run generate-basemaps --basemap=ch-municipalities-geographic

// combines versions of each basemap to a single file
npm run final-basemaps --basemap=ch-municipalities-geographic

// runs all three steps after each other
npm run prepare-basemaps --basemap=ch-municipalities-geographic
```

### Import Basemaps

The import basemaps step is responsible for loading the basemaps into the choropleth database. The following environment variables need to be set:

#### COUCHDB

Defines the database parameters to import the basemaps:

```json
{
  "host": "couchdb.example.com",
  "database": "example-choropleth-basemaps",
  "username": "user-with-write-access",
  "password": "very-secure-password"
}
```

#### Q_SERVER_BASE_URL

Defines the Q-Server-Baseurl which is used to upload a basemap file to an object storage.

#### USERNAME

Defines the username which is used to get the authentication token in order to upload a basemap file.

#### (optional) Q_SERVER_AUTH

Defines the bearer token directly. If this environment variable is set, the password will not be asked. This can be used for debugging or in server environment where a password prompt is not desirable.

The import basemaps process can be run like this:

```js
npm run import-basemaps
```

Or for a single basemap like this:

```js
npm run import-basemaps --basemap=ch-municipalities-geographic
```
