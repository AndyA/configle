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

/**
 * Load config files from directories at and above the current directory to build
 * a merged config.
 *
 * @param {string} [baseName]   - the base name for the config file
 * @param {Object} [options]    - configuration options
 * @param {String} [options.baseName] - the base name may be included as an
 *          option or a parameter.
 * @returns {Configle}          - a Configle object
 */

Configle.load = function() {};

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
