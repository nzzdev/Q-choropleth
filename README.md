# Q-choropleth

<!-- <travis-badge> <greenkeeper-badge> -->
<!-- TODO: complete this -->

**maintainer**: [Sharon Funke](https://github.com/fuenkchen)

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

#### Hexagon

#### Sizing

#### Legend

[to the top](#table-of-contents)

### Options

#### choroplethType

#### numericalOptions

#### categoricalOptions

[to the top](#table-of-contents)

## License

Copyright (c) 2020 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.
