# Q-choropleth [![Build Status](https://travis-ci.com/nzzdev/Q-choropleth.svg?token=bwR7zbPTTpEoDxbY2dJR&branch=dev)](https://travis-ci.com/nzzdev/Q-choropleth)

**maintainer**: [philipkueng](https://github.com/philipkueng)

Short description of tool and link to either [demo](https://editor.q.tools/) or [playground](https://q-playground.st.nzz.ch).

## Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Functionality](#functionality)
- [License](#license)

## Installation

```
git clone git@github.com:nzzdev/Q-choropleth.git
cd ./Q-choropleth
nvm use
npm install
npm run build
```

[to the top](#table-of-contents)

## Configuration

- `METHOD_BOX_ARTICLE` is an object that contains two properties: `title` and `url`.
  Those properties will be used in the `MethodBox`-component. The defined article will lead to the article where we show how we caluclate the bucketing method.
- `COUCHDB` is an object that contains four properties: `host`, `database`, `user` and `pass`. This object is used to connect to the couchdb containing the basemaps.

## Development

Start the Q dev server:

```
npx @nzz/q-cli server
```

Run the Q tool:

```
node index.js
```

[to the top](#table-of-contents)

## Testing

The testing framework used in this repository is [Code](https://github.com/hapijs/code).

Run the tests:

```
npm run test
```

### Implementing a new test

When changing or implementing...

- A `route`, it needs to be tested in the `e2e-tests.js` file
- Something on the frontend, it needs to be tested in the `dom-tests.js` file

[to the top](#table-of-contents)

## Deployment

We provide automatically built docker images at https://hub.docker.com/r/nzzonline/q-xxx/.
There are three options for deployment:

- Use the provided images
- Build your own docker images
- Deploy the service using another technology

### Use the provided docker images

1. Deploy `nzzonline/q-choropleth` to a docker environment
2. Set the ENV variables as described in the [configuration section](#configuration)

[to the top](#table-of-contents)

## Functionality

The tool structure follows the general structure of each Q tool. Further information can be found in [Q server documentation - Developing tools](https://nzzdev.github.io/Q-server/developing-tools.html).

### Features

#### Basemaps

The basemaps are stored in a couchdb database. Basemaps are versioned, because administrative regions can change over time. The user can select the desired version when creating the map. The structure looks like this:

```json
{
  "_id": "ch-cantons-hexagon",
  "title": "Hexagon Schweiz (Kantone)",
  "versions": [
    {
      "validFrom": "1997-01-01T00:00:00.000Z",
      "data": "linkToBasemap"
    },
    {
      "validFrom": "1985-01-01T00:00:00.000Z",
      "data": "linkToBasemap"
    }
  ]
}
```

The data of the basemap is stored in `json`-format in the following structure:

```json
{
  "config": {
    "displayEntityType": "code",
    "defaultEntityType": "name",
    "entityTypes": {
      "name": "Name",
      "bfsNumber": "BfS Nummer",
      "code": "Abkürzung"
    }
  },
  "entities": {}
}
```

Every basemap has a `config` and `entities` property. The `config` object must contain the properties `defaultEntityType` and `entityTypes`. The structure of the `entities` objects depends on the type of basemap.

#### Hexagon Map

The hexagon-objects will be created in the function `getHexagons()`, where the `entities` will be iterated and filled up with the following information:

- `text`: the `cantonCode` and the `displayValue`
- `fontSize`: font-size based on the `contentWidth`,
- `color`: color based on the `cantonCode` and the `legendData`,
- `width`: pre-defined,
- `height`: pre-defined,
- `type`: either `fill` or `stroke`,
- `x`,
- `y`: `rowIndex` \* `rowHeight`

The array of hexagons will then be iterated in the `HexagonMap` component, where all the information will be passed to the `Hexagon` component.
The function `getPolygonPoints()` will then process those information used to display the polygon.

#### Geographic Map

The `entities` property of geographic maps contains a topojson object. This object represents all administrative regions. Optionally an outline object can be added to give more context.

The `d3-geo` library is used to create the svg path of each geographic features. The `GeographicMap` component is responsible to create the svg object and iterate through each geographic feature. The `Feature` and `FeatureOutline` render a single svg path.

#### Sizing

All calculations we use for sizing is based from the [redblobgames hexagons guide](https://www.redblobgames.com/grids/hexagons/). The functions used are in the `hexagon.js` helper-file.

#### Legend

The way the legend will be displayed is depending on the `choroplethType`. When using `numerical`-option, the range of the values will be calculated by buckets, which can be changed on the options. The lowest and highest value will be displayed on the left and right end of the legend.

Depending on the selected bucketing method, the legend will be displayed differently. The array passed to render the legend looks as following:

```
buckets = [
    {
        from, // lowest bucket border value
        to, // highest bucket border value
        color, // color depending on the selected color schema
    },
]
```

If there's the case that one of the bucket has just a single value in it, the single bucket will be displayed below with a seperate icon.
If there is an entry without a value, there will be an extra icon too, for displaying 'no data'.

The `categorical` legend will simply map the values to their colors.

#### Annotations

Up to a maximum of five annotations can be added to hexagon maps as well as geographic ones. Each annotation is able to have multiple regions.

The array iterated to render the annotations looks as following:

```
annotationLines = [
  {
    coordinates // Coordinates for drawing the icon on the map (automatically generated)
    id          // The number shown in the icon (automatically generated)
    position    // Can be 'top', 'left', 'bottom' or 'right'
  }
]
```

For correctly placing them on the hexagon map, the function `getAnnotationsForHexMap()` is used for calculating the coordinates. The same happens for the geographic map using the function `getAnnotationsForGeoMap()`. If the annotation has a single region, the annotation is drawn in svg using the `circle` element for the icon and the `line` element for connecting it to its region. If the annotation has mulitple regions, a connection line between the lines and an extra bow will be drawn. If there are multiple annotations on the same axis, the function `removeDoubleAxisCoordinates()` calculates, depending on the position(top, right, bottom, left), which line will be drawn.

An annotation can be positioned on top, left, bottom or right of the map. On narrow viewports (such as mobile screens) the annotations on the left will be automatically displayed on the top and annotations on the right on the bottom, otherwise the map will get too small.

All the `Hexagon` and `Feature` elements, which have an annotation linked to, will be highlighted with a black border.

[to the top](#table-of-contents)

### Display options

#### choroplethType

There are two types of maps: the `numerical` and the `categorical` one. Depending on the selection, different options will be available.

#### numericalOptions

##### noValuesOnMap

This option will either show or hide de value displayed inside the hexagon.

##### labelLegend

This option allows to show the `average`, oder `median` value to be displayed in the legend. It can be hidden too.

##### bucketType

There are four different buckets-types and each comes with it's own properties:

- Jenks Natural Breaks: Amount of buckets

- Quantile: Amount of buckets

- Same size buckets: Amount of buckets

- Manually defined buckets: Amount of buckets and the max value borders

#### categoricalOptions

##### noValuesOnMap

This option will either show or hide de value displayed inside the hexagon.

##### customCategoriesOrder

This option allows to override the default order of the categories in the legend. By default, the categories are sorted by frequency.

[to the top](#table-of-contents)

## License

Copyright (c) 2020 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.
