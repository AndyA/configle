"use strict";

var _ = require("underscore");
var path = require("path");

function isAbsolute(str) {
  var p = path.parse(str);
  return p.root.length;
}

function makeSmartString(obj, fromDir) {
  var str = new String(obj); // eslint-disable-line no-new-wrappers
  str.toPathName = function() {
    var me = this.toString();
    if (isAbsolute(me)) {
      return me;
    }
    return path.join(this.toPathName.fromDir, me);
  }
  str.toPathName.fromDir = fromDir;
  return str;
}

/**
 * A wrapper for a string from a config file
 * @module configle/lib/smart-string
 */

var SmartString = {
  isSmart: function(obj) {
    return _.isString(obj) && obj.hasOwnProperty("toPathName");
  },

  staySmart: function(str, filt) {
    var newStr = filt(str);
    return SmartString.isSmart(str) ?
      makeSmartString(newStr, str.toPathName.fromDir) : newStr;
  },

  setString: function(str, newStr) {
    return SmartString.staySmart(str, function() {
      return newStr;
    });
  },

  smarten: function(obj, fromDir) {
    if (SmartString.isSmart(obj)) {
      return obj;
    }
    if (_.isString(obj)) {
      return makeSmartString(obj, fromDir);
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
