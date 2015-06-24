# Configle

Configle is a config system.

## Install

```sh
npm install AndyA/configle
```

## Simple usage

```javascript
var Configle = require("configle");

// Load and merge any myconfig.json found in or above the current directory
var config = Configle.load("myconfig");

// Use config as a plain Object
var baseDir = config.baseDir;

// Or call its getter
var baseDir = config.get("baseDir");

// Use a path through the config object
var connURI = config.get("db.default.connection");

// Search multiple paths
var connURI = config.get("db.(test|default).connection");

// Get a config that merges multiple paths
var dbConfig = config.get("db.(local|test|default)");
var connURI = dbConfig.get("connection");

// Treat a string as a filename
var workDir = config.get("workDir");
// toPath() resolves relative to the dir that supplied the
// "workDir" config item
var tmpFile = path.join(workDir.toPath(), "work.dat");

```

