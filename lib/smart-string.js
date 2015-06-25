"use strict";

var _ = require("underscore");
var path = require("path");

function isAbsolute(str) {
  var p = path.parse(str);
  return p.root.length;
}

function makeGetPath(str, fromDir) {
  if (isAbsolute(str)) {
    return function() {
      return str;
    };
  }
  return function() {
    return path.join(fromDir, str);
  };
}

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

var SmartString = {
  isSmart: function(obj) {
    return _.isString(obj) && obj.hasOwnProperty("getPath");
  },

  smarten: function(obj, fromDir) {
    if (SmartString.isSmart(obj)) {
      return obj;
    }
    if (_.isString(obj)) {
      var str = new String(obj); // eslint-disable-line no-new-wrappers
      str.getPath = makeGetPath(obj, fromDir);
      return str;
    }
    var smarten = function(elt) {
      return SmartString.smarten(elt, fromDir);
    };
    if (_.isArray(obj)) {
      return obj.map(smarten);
    }
    if (_.isObject(obj)) {
      return _.mapObject(obj, smarten);
    }
    // Give up
    return obj;
  }
};

module.exports = SmartString;
