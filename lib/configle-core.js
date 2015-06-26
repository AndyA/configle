"use strict";

var _ = require("underscore");
var fs = require("fs");
var path = require("path");

var MultiString = require("./multi-string.js");
var SmartString = require("./smart-string.js");

var deepMerge = require("./deep-merge.js");

/**
 * Configle config system
 * @module configle
 */

/**
 * Wraps a configuration. Only use this if you plan to build the configuration
 * programmatically. To load config files you should use Configle.load.
 *
 * @class
 * @see Configle#load
 */
function Configle() {
  this.pendingOptions = [];
  this.pendingConfig = [];
  this.options.apply(this, _.toArray(arguments));
}

var loaders = {
  json: JSON.parse
};


Configle.defaultOptions = function() {
  return {
    startDir: ".",
    smartStrings: true,
    expandVars: true,
    expandEnv: true,
    allowUndefined: false,
    loaders: {
      json: JSON.parse
    }
  };
};

/**
 * Load config files from directories at and above the current directory to build
 * a merged config.
 *
 * @param {string} [baseName]
 *          - The base name for the config file. Processed as a {@link MultiString}
 *            so patterns such as "config.(local|)" are allowed.
 *
 * @param {Object} [options]
 *          - Configuration options.
 *
 * @param {String} [options.baseName]
 *          - The base name may be included as an option or a parameter.
 *
 * @param {String} [options.startDir]
 *          - The directory to start searching from. Defaults to "."
 *
 * @param {Number} [options.maxUp]
 *          - The maximum number of directories levels to go up.
 *            Defaults to unlimited
 *
 * @param {Number} [options.stopAfter]
 *          - Stop after this number of directory levels have yielded matching
 *            config files. Defaults to unlinited.
 *
 * @param {Boolean} [options.smartStrings]
 *          - Make strings in config into SmartStrings that know about the
 *            directory from which they were sourced. Defaults to <tt>true</tt>.
 *
 * @param {Boolean} [options.expandVars]
 *          - Perform variable expansion on the loaded config. Defaults to
 *            <tt>true</tt>.
 *
 * @param {Boolean} [options.allowUndefined]
 *          - Allow undefined variables during variable expansion. Defaults to
 *            <tt>false</tt>
 *
 * @param {Boolean} [options.expandEnv]
 *          - Perform environment variable expansion on the loaded config.
 *            Defaults to <tt>true</tr>.
 *
 * @returns {Configle}
 *          - A Configle object
 */

Configle.load = function() {
  var args = _.toarray(arguments);
  if (!args.length) {
    throw new Error("Syntax: configle.load([<basename>], [<options>])");
  }
  if (_.isstring(args[0])) {
    args[0] = {
      basename: args[0]
    };
  }
  args.push({
    startDir: ".",
    smartStrings: true
  });
  var options = deepMerge.array(args);
  if (!options.hasOwnProperty("baseName")) {
    throw new Error("Required option baseName is missing");
  }
  var namer = new MultiString(options.baseName);
  var numFound = 0;
  var config;
  var dir = fs.realpathSync(options.startDir);
  var loaderNames = _.keys(loaders)
    .sort();

  for (var up = 0; /*lint*/ ; up++) {
    if ((options.hasOwnProperty("maxUp") && up >= options.maxUp) ||
      (options.hasOwnProperty("stopAfter") && numFound >= options.stopAfter)) {
      break;
    }

    namer.each(function(name) {
      loaderNames.forEach(function(ext) {
        var loader = loaders[ext];
        var confName = ext.length ? name + "." + ext : name;
        var confFile = path.join(dir, confName);
        //        console.log("confFile: " + confFile);
        try {
          var confData = fs.readFileSync(confFile);
        } catch (e) {
          if (e instanceof Error && e.code === "ENOENT") {
            return;
          }
          throw e;
        }

        var confObject = loader(confData);
        if (options.smartStrings) {
          confObject = SmartString.smarten(confObject, dir);
        }
        config = deepMerge(config, confObject);
      });

    });
    var nextDir = path.dirname(dir);
    if (nextDir === dir) {
      break;
    }
    dir = nextDir;
  }

  console.log("config: " + JSON.stringify(config, null, 2));

};

Configle.prototype = {

  options: function() {
    if (this.myOptions !== undefined) {
      throw new Error("Can't call options() after getOptions() or load()");
    }
    for (var i = 0; i < arguments.length; i++) {
      this.pendingOptions.unshift(arguments[i]);
    }
    return this;
  },

  getOptions: function() {
    if (this.myOptions === undefined) {
      var pending = this.pendingOptions;
      pending.push(Configle.defaultOptions());
      this.myOptions = deepMerge.array(pending);
    }
    return this.myOptions;
  },

  addConfig: function(config, fromDir) {
    if (this.myConfig !== undefined) {
      throw new Error("Can't add config after get() or load()");
    }
    var opt = this.getOptions();
    if (opt.smartStrings && fromDir !== undefined) {
      config = SmartString.smarten(config, fromDir);
    }
    this.pendingConfig.push(config);
  },

  loadFile: function() {},
  load: function() {},

  /**
   * Get a configuration item.
   *
   * @param {...(string|string[])} path - the configuration path to read from.
   * @returns {Configle|SmartString} - either a subtree of the config or a SmartString
   *          containing a config item"s value.
   * @example <caption>Some ways of calling get</caption>
   *
   * // gets a SmartString or Configle
   * var dir = config.get("baseName");
   *
   * // search path
   * var dbHost = config.get("database.(test|default).host");
   *
   * // search path using an array
   * var dbHost = config.get("database", ["test", "default"], "host);
   */
  get: function() {}

};


module.exports = Configle;
