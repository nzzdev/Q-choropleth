# Q-choropleth

<!-- <travis-badge> <greenkeeper-badge> -->
<!-- TODO: complete this -->

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

There's one env variable `METHOD_BOX_ARTICLE` that needs to be defined. `METHOD_BOX_ARTICLE` is an object that contains two properties: `title` and `url`.
Those properties will be used in the `MethodBox`-component. The defined article will lead to the article where we show how we caluclate the bucketing method.

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

The basemaps are saved as `json`-format in the following structure:

- `type`: the type of the map. Currently the only type implemented is "Geometry"
- `config`: contains the following properties `rows`, `columns` and `grid`. `grid` is an array of arrays, where the structure of the map is set.

Ex.:

```
"grid": [
    [null, null, "BS", "BL", "SH", "TG", null],
    [null, "JU", "SO", "AG", "ZH", "AR", "AI"],
    [null, "NE", "BE", "LU", "ZG", "SZ", "SG"],
    ["VD", "FR", "OW", "NW", "UR", "GL", "GR"],
    ["GE", null, "VS", null, null, "TI", null]
]
```

- `cantons`: an array of objects, containing the `id`, `code` and `name`

The `json`-files will then be implemented in the `entityCollection`-route. The infos will then be available by calling the function `getEntityCollectionInfo`, which will be usable when implementing the `baseMap`-helper.

#### Hexagon

The hexagon-objects will be created in the function `getHexagons()`, where the grid passed by the `entityCollectionInfo` will be iterated and filled up with the following information:

- `text`: the `cantonCode` and the `displayValue`
- `fontSize`: font-size based on the `contentWidth`,
- `color`: color based on the `cantonCode` and the `legendData`,
- `width`: pre-defined,
- `height`: pre-defined,
- `type`: either `fill` or `stroke`,
- `x`,
- `y`: `rowIndex` \* `rowHeight`

The array of hexagons will then be iterated in the `HexagonCHCantonsMap` component, where all the information will be passed to the `Hexagon` component.
The function `getPolygonPoints()` will then process those information used to display the polygon.

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

[to the top](#table-of-contents)

## License

Copyright (c) 2020 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.
