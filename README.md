# egg-ts-helper

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Appveyor status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[npm-image]: https://img.shields.io/npm/v/egg-ts-helper.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-ts-helper
[travis-url]: https://travis-ci.org/whxaxes/egg-ts-helper
[travis-image]: http://img.shields.io/travis/whxaxes/egg-ts-helper.svg
[appveyor-url]: https://ci.appveyor.com/project/whxaxes/egg-ts-helper/branch/master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/github/whxaxes/egg-ts-helper?branch=master&svg=true
[coveralls-url]: https://coveralls.io/r/whxaxes/egg-ts-helper
[coveralls-image]: https://img.shields.io/coveralls/whxaxes/egg-ts-helper.svg

A simple tool for generates typescript definition files(d.ts) for [egg](https://eggjs.org) application. Injecting `controller`,`proxy`,`service` and `extend` to egg by [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)


## Install

```
npm i egg-ts-helper -g
```

or

```
yarn global add egg-ts-helper
```

## QuickStart

Open your egg application, executing the command

```
$ ets
```

`-w` flag can auto recreated d.ts while file changed

```
$ ets -w
```

## Usage

```
$ ets -h

  Usage: ets [commands] [options]

  Options:

    -v, --version           output the version number
    -w, --watch             Watching files, d.ts will recreate after file has changed
    -c, --cwd [path]        Egg application base dir (default: process.cwd)
    -C, --config [path]     Configuration file, The argument can be a file path to a valid JSON/JS configuration file.（default: {cwd}/tshelper.js
    -f, --framework [name]  Egg framework(default: egg)
    -s, --silent            Running without output
    -i, --ignore [dirs]     Ignore watchDirs, your can ignore multiple dirs with comma like: -i controller,service
    -e, --enabled [dirs]    Enable watchDirs, your can enable multiple dirs with comma like: -e proxy,other
    -E, --extra [json]      Extra config, the value should be json string
    -h, --help              output usage information

  Commands:

    clean                   Clean js file when it has the same name ts file
```

## Options

| name | type | default | description |
| --- | --- | --- | --- |
| cwd | string | process.cwd | egg application base dir |
| framework | string | egg | egg framework |
| typings | string | {cwd}/typings | typings dir |
| caseStyle | string | lower | egg case style(lower,upper,camel) |
| watch | boolean | false | watch file change or not |
| watchOptions | object | undefined | chokidar [options](https://github.com/paulmillr/chokidar#api) |
| execAtInit | boolean | false | execute d.ts generation while instance was created |
| configFile | string | {cwd}/tshelper.js | configure file path |
| watchDirs | object | | generator configuration |

egg-ts-helper would watching `app/extend`,`app/controller`,`app/service`, `app/config`, `app/middleware`, `app/model` by default. The dts would recreated when the files under these folders was changed.

you can disabled some folders by `-i` flag.

```
$ ets -i extend,controller
```

or configure in the config file

```
// {cwd}/tshelper.js

module.exports = {
  watchDirs: {
    extend: false,
    controller: false,
  }
}
```

or configure in package.json

```
// {cwd}/package.json

{
  "egg": {
    "framework": "egg",
    "tsHelper": {
      "watchDirs": {
        "extend": false
      }
    }
  }
}
```

## Extend

`egg-ts-helper` not only support the base loader( controller, middleware ... ), but also support to configure your own loader.

### Use build-in generator

for example. If I want to auto create the d.ts for `egg-mongodb`. configuring watchDirs in `{cwd}/tshelper.js` and use `class` generator

```typescript
// ./tshelper.js

module.exports = {
  watchDirs: {
    model: {
      path: 'app/model', // dir path
      // pattern: '**/*.(ts|js)', // glob pattern, default is **/*.(ts|js). it doesn't need to configure normally.
      generator: 'class', // generator name
      framework: 'larva', // framework name
      interface: 'IModel',  // interface name
      caseStyle: 'upper', // caseStyle for loader
      interfaceHandle: val => `ReturnType<typeof ${val}>`, // interfaceHandle
      trigger: ['add', 'unlink'], // recreate d.ts when receive these events, all events: ['add', 'unlink', 'change']
    }
  }
}
```

the configuration can create d.ts like below.

```
import Station from '../../../app/model/station';

declare module '{ framework }' {
  interface { interface } {
    Station: { interfaceHandle ? interfaceHandle('Station') : Station };
  }
}
```

and don't forget to declare IModel to egg.

```typescript
// typings/index.d.ts
import { PlainObject } from 'egg';

declare module 'egg' {
  interface Application {
    model: IModel
  }

  interface IModel extends PlainObject {
  }
}
```


### Define custom generator

```javascript
// ./tshelper.js

// custom generator
function myGenerator(config, baseConfig) {
  // config.dir       dir
  // config.dtsDir    d.ts dir
  // config.file      changed file
  // config.fileList  file list
  console.info(config);
  console.info(baseConfig);

  return {
    dist: 'd.ts file url',
    content: 'd.ts content'
  }
}

module.exports = {
  watchDirs: {
    model: {
      path: 'app/model',
      generator: myGenerator,
      trigger: ['add', 'unlink'],
    }
  }
}
```

## Register

You can require register to start egg-ts-helper before starting egg application with [egg-bin](https://github.com/eggjs/egg-bin).

```
$ egg-bin dev -r egg-ts-helper/register
```

debugging

```
$ egg-bin debug -r egg-ts-helper/register
```

## Generated Code

see https://github.com/whxaxes/egg-ts-helper/tree/master/test/fixtures/real/typings


## Demo

see https://github.com/whxaxes/egg-boilerplate-d-ts
