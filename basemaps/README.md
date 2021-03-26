## Choropleth Basemaps

Extracts, tranforms and loads (ETL) choropleth basemaps. This process is separated in two steps:

### Prepare Basemaps

The prepare basemaps step is responsible for extracting and transforming the source data.

The basemap configuration file contains all details for each kind of basemap. Each basemap has specific requirements to extracting and transforming. Therefore each basemap provides a `download` and `transform` function. This makes it possible that each basemap can handle these steps according to their specific requirements.

Every step of the prepare basemap process can be run separately. This makes debugging a problem easier:

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

### (optional) Q_SERVER_AUTH

Defines the bearer token directly. If this environment variable is set, the password will not be asked. This can be used for debugging or in server environment where a password prompt is not desirable.

The import basemaps process can be run like this:

```js
npm run import-basemaps

```
