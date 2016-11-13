[![Angular 2 Style Guide](https://mgechev.github.io/angular2-style-guide/images/badge.svg)](https://github.com/mgechev/angular2-style-guide)
[![Build Status](https://travis-ci.org/NativeScript/plugins.svg?branch=master)](https://travis-ci.org/NativeScript/plugins)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/NativeScript/plugins.svg)](https://david-dm.org/NativeScript/plugins)
[![devDependency Status](https://david-dm.org/NativeScript/plugins/dev-status.svg)](https://david-dm.org/NativeScript/plugins#info=devDependencies)
[![Stack Share](http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](http://stackshare.io/NativeScript/plugins)
[![Stories in Progress](https://badge.waffle.io/NativeScript/plugins.png?label=in%20progress&title=Stories%20In%20Progress)](https://waffle.io/NativeScript/plugins)

# The Official NativeScript Plugins Resource

Currently a work in progress.

# Contributing

## Table of Contents

- [Prerequisites](#prerequisites)
- [How to start](#how-to-start)
- [How to start with AoT compilation](#how-to-start-with-aot-compilation)
- [NativeScript App](#nativescript-app)
- [Electron App](#electron-app)
- [Running tests](#running-tests)
- [Framework How-Tos](#framework-how-tos)
- [Web Configuration Options](#web-configuration-options)
- [License](#license)

### Prerequisites

* node v5.x.x or higher and npm 3 or higher.

* To run the NativeScript app:

```
npm install -g nativescript
npm install -g typescript
```

## How to start

```bash
# install the project's dependencies
$ npm install
# fast install (via Yarn, https://yarnpkg.com)
$ yarn install  # or yarn

# watches your files and uses livereload by default
$ npm start
# api document for the app
# npm run build.docs

# to start deving with livereload site and coverage as well as continuous testing
$ npm run start.deving

# dev build
$ npm run build.dev
# prod build
$ npm run build.prod
```

## How to start with AoT compilation

**Note** that AoT compilation requires **node v6.5.0 or higher** and **npm 3.10.3 or higher**.

In order to start the seed with AoT use:

```bash
# prod build with AoT compilation
$ npm run build.prod.exp
```

When using AoT compilation, please consider the following:

Currently you cannot use custom component decorators with AoT compilation. This may change in the future but for now you can use this pattern for when you need to create AoT builds for the web:

```
import { Component } from '@angular/core';
import { BaseComponent } from '../frameworks/core/index';

// @BaseComponent({   // just comment this out and use Component from 'angular/core'
@Component({
  // etc.
```

After doing the above, running AoT build via `npm run build.prod.exp` will succeed. :)

`BaseComponent` custom component decorator does the auto `templateUrl` switching to use {N} views when running in the {N} app therefore you don't need it when creating AoT builds for the web. However just note that when going back to run your {N} app, you should comment back in the `BaseComponent`. Again this temporary inconvenience may be unnecessary in the future.

## NativeScript App

#### Setup

```
npm install -g nativescript 
```

#### Run

```
iOS:                      npm run start.ios
iOS (livesync emulator):  npm run start.livesync.ios
iOS (livesync device):    npm run start.livesync.ios.device

// or...

Android:                      npm run start.android
Android (livesync emulator):  npm run start.livesync.android
Android (livesync device):    npm run start.livesync.android.device
```

* Requires an image setup via AVD Manager. [Learn more here](http://developer.android.com/intl/zh-tw/tools/devices/managing-avds.html) and [here](https://github.com/NativeScript/nativescript-cli#the-commands).

OR...

* [GenyMotion Android Emulator](https://www.genymotion.com/)

##### Building with Webpack for release builds

You can greatly reduce the final size of your NativeScript app by the following:

```
cd nativescript
npm i nativescript-dev-webpack --save-dev
```
Then you will need to modify your components to *not* use `moduleId: module.id` and change `templateUrl` to true relative app, for example:

before:

```
@BaseComponent({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
```
after:

```
@BaseComponent({
  // moduleId: module.id,
  selector: 'sd-home',
  templateUrl: './app/components/home/home.component.html',
  styleUrls: ['./app/components/home/home.component.css']
})
```

Then to build:

Ensure you are in the `nativescript` directory when running these commands.

* iOS: `WEBPACK_OPTS="--display-error-details" tns build ios --bundle`
* Android: `WEBPACK_OPTS="--display-error-details" tns build android --bundle`

Notice your final build will be drastically smaller. In some cases 120 MB -> ~28 MB. 👍 

## Electron App

#### Develop

```
Mac:      npm run start.desktop
Windows:  npm run start.desktop.windows
```

#### Develop with livesync
```
Mac:      npm run start.livesync.desktop
Windows:  npm run start.livesync.desktop.windows
```

#### Release: Package Electron App for Mac, Windows or Linux

```
Mac:      npm run build.desktop.mac
Windows:  npm run build.desktop.windows
Linux:    npm run build.desktop.linux
```

## Running tests

```bash
$ npm test

# Development. Your app will be watched by karma
# on each change all your specs will be executed.
$ npm run test.watch
# NB: The command above might fail with a "EMFILE: too many open files" error.
# Some OS have a small limit of opened file descriptors (256) by default
# and will result in the EMFILE error.
# You can raise the maximum of file descriptors by running the command below:
$ ulimit -n 10480


# code coverage (istanbul)
# auto-generated at the end of `npm test`
# view coverage report:
$ npm run serve.coverage

# e2e (aka. end-to-end, integration) - In three different shell windows
# Make sure you don't have a global instance of Protractor

# npm install webdriver-manager <- Install this first for e2e testing
# npm run webdriver-update <- You will need to run this the first time
$ npm run webdriver-start
$ npm run serve.e2e
$ npm run e2e

# e2e live mode - Protractor interactive mode
# Instead of last command above, you can use:
$ npm run e2e.live
```
You can learn more about [Protractor Interactive Mode here](https://github.com/angular/protractor/blob/master/docs/debugging.md#testing-out-protractor-interactively)

## Web Configuration Options

Default application server configuration

```javascript
var PORT             = 5555;
var LIVE_RELOAD_PORT = 4002;
var DOCS_PORT        = 4003;
var APP_BASE         = '/';
```

## License

Apache 2.0