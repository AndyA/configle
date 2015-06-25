"use strict";

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

//var loaders = {
//  json: JSON.parse
//};

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
 * @returns {Configle}
 *          - A Configle object
 */

Configle.load = function() {

};

Configle.prototype = {

  /**
   * Get a configuration item.
   *
   * @param {...(string|string[])} path - the configuration path to read from.
   * @returns {Configle|SmartString} - either a subtree of the config or a SmartString
   *          containing a config item's value.
   * @example <caption>Some ways of calling get</caption>
   *
   * // gets a SmartString or Configle
   * var dir = config.get("baseDir");
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
