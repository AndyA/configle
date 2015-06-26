"use strict";

// Core
var Configle = require("./lib/configle-core.js");

// Classes
Configle.ConfigData = require("./lib/config-data.js");
Configle.MultiString = require("./lib/multi-string.js");
Configle.SmartString = require("./lib/smart-string.js");

// Functions
Configle.deepMerge = require("./lib/deep-merge.js");
Configle.interpolate = require("./lib/interpolate.js");

module.exports = Configle;
