[![Angular Style Guide](https://mgechev.github.io/angular2-style-guide/images/badge.svg)](https://angular.io/styleguide)
[![Build Status](https://travis-ci.org/NativeScript/plugins.svg?branch=master)](https://travis-ci.org/NativeScript/plugins)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/NativeScript/plugins.svg)](https://david-dm.org/NativeScript/plugins)
[![devDependency Status](https://david-dm.org/NativeScript/plugins/dev-status.svg)](https://david-dm.org/NativeScript/plugins#info=devDependencies)

# The Official NativeScript Plugins Resource

Currently a work in progress.

# Contributing

## Table of Contents

- [Credits](#credits)
- [Prerequisites](#prerequisites)
- [How to start](#how-to-start)
- [How to start with AoT compilation](#how-to-start-with-aot-compilation)
- [Mobile App](#mobile-app)
- [Desktop App](#desktop-app)
- [Running tests](#running-tests)
- [Web Configuration Options](#web-configuration-options)
- [License](#license)

## Credits

- [site loader](https://codepen.io/ashmind/pen/zqaqpB)
- Project seeded from [angular-seed-advanced](https://github.com/NathanWalker/angular-seed-advanced)

### Prerequisites

**node v6.5.0 or higher** and **npm 3.10.3 or higher**.

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

# generate api documentation
$ npm run compodoc
$ npm run serve.compodoc

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
$ npm run build.prod.aot
```

## Mobile App

The mobile app is provided via [NativeScript](https://www.nativescript.org/), an open source framework for building truly native mobile apps.

#### Setup

```
npm install -g nativescript 
```

#### Run

```
iOS:                      npm run start.ios
iOS (device):             npm run start.ios.device

// or...

Android:                      npm run start.android
Android (device):             npm run start.android.device
```

* Requires an image setup via AVD Manager. [Learn more here](http://developer.android.com/intl/zh-tw/tools/devices/managing-avds.html) and [here](https://github.com/NativeScript/nativescript-cli#the-commands).

OR...

* [GenyMotion Android Emulator](https://www.genymotion.com/)

## Desktop App

The desktop app is provided via [Electron](http://electron.atom.io/), cross platform desktop apps
with JavaScript, HTML, and CSS.

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

## Deploying

```
npm run build.prod
cd server
modulus deploy
```

## License

Apache 2.0