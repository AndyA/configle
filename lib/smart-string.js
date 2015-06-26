"use strict";

var _ = require("underscore");
var path = require("path");

function isAbsolute(str) {
  var p = path.parse(str);
  return p.root.length;
}

function makeSmartString(obj, fromDir) {
  if (!_.isString(obj) || fromDir === undefined) {
    return obj;
  }
  var str = new String(obj); // eslint-disable-line no-new-wrappers
  str.toPathname = function() {
    var me = this.toString();
    if (isAbsolute(me)) {
      return me;
    }
    return path.join(this.toPathname.fromDir, me);
  };
  str.toPathname.fromDir = fromDir;
  return str;
}

var SmartString;

function withSmartString(obj, cb) {
  if (SmartString.isSmart(obj)) {
    return cb(obj);
  }
  if (!_.isObject(obj)) {
    return obj;
  }
  var cook = function(elt) {
    return withSmartString(elt, cb);
  };
  if (_.isArray(obj)) {
    return obj.map(cook);
  }
  return _.mapObject(obj, cook);
}

/**
 * A wrapper for a string from a config file
 * @module configle/lib/smart-string
 */

SmartString = {
  isSmart: function(obj) {
    return _.isString(obj) && obj.hasOwnProperty("toPathname");
  },

  staySmart: function(str, filt) {
    var newStr = filt(str);
    return SmartString.isSmart(str) ?
      makeSmartString(newStr, str.toPathname.fromDir) : newStr;
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
  },

  toStrings: function(obj) {
    return withSmartString(obj, function(elt) {
      return elt.toString();
    });
  },

  toPathnames: function(obj) {
    return withSmartString(obj, function(elt) {
      return elt.toPathname();
    });
  }

};

module.exports = SmartString;
