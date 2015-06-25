"use strict";

var path = require("path");

/**
 * A wrapper for a string from a config file
 * @module configle/lib/smart-string
 */

/**
 * A wrapper for a string from a config file. It knows the directory it was sourced
 * from so that it can be resolved as a filename relative to the current directory.
 *
 * @class
 * @param {string} value      - the string value
 * @param {string} [fromDir]  - the directory containing the config where the string was found
 */
function SmartString(value, fromDir) {
  this.value = value;
  this.fromDir = fromDir || process.cwd();
}

SmartString.prototype = {

  /**
   * Stringification: returns the plain string value. Called automatically to stringify
   * the object.
   *
   * @method
   * @returns {string} - the plain value of the string
   */
  toString: function() {
    return this.value;
  },

  /**
   * Return a pathname constructed by prepending the value of <tt>fromDir</tt> to
   * the string's value.
   *
   * @method
   * @returns {string} - the pathname
   */
  toPath: function() {
    return path.join(this.fromDir, this.value);
  }

};

module.exports = SmartString;
