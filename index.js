"use strict";

var _ = require("underscore");
var deepMerge = require("./lib/deep-merge.js");
var fs = require("fs");
var path = require("path");

var MultiString = require("./lib/multi-string.js");
var SmartString = require("./lib/smart-string.js");

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

}

var loaders = {
  json: JSON.parse
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
 *            Defaults to unlinited.
 *
 * @param {Number} [options.stopAfter]
 *          - Stop after this number of directory levels have yielded matching
 *            config files. Defaults to unlinited.
 *
 * @param {Number} [options.smartStrings]
 *          - Make strings in config into SmartStrings that know about the
 *            directory from which they were sourced. Defaults to <tt>true</tt>.
 *
 * @returns {Configle}
 *          - A Configle object
 */

Configle.load = function() {
  var args = _.toArray(arguments);
  if (!args.length) {
    throw new Error("Syntax: Configle.load([<baseName>], [<options>])");
  }
  if (_.isString(args[0])) {
    args[0] = {
      baseName: args[0]
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
