"use strict";

var _ = require("underscore");
var deepMerge = require("./deep-merge.js");
var MultiString = require("./multi-string.js");
var SmartString = require("./smart-string.js");
var Interpolate = require("./interpolate.js");

var ConfigData = {

  walkPath: function(data, pathSpec) {
    if (pathSpec.length === 0) {
      return undefined;
    }
    var path = pathSpec.split(".");
    for (var i = 0; i < path.length; i++) {
      if (!_.isObject(data)) {
        return undefined;
      }
      var key = path[i];
      data = data[key];
    }
    return data;
  },

  get: function(config, pathSpec) {
    var ms = new MultiString(pathSpec);
    var out;
    ms.each(function(path) {
      var val = ConfigData.walkPath(config, path);
      out = deepMerge(out, val);
    });
    return out;
  },

  expandVars: function(config) {
    function resolveEnv(key) {
      return process.env[key];
    }

    // TODO recursive resolution
    function resolveConfig(key) {
      return ConfigData.get(config, key);
    }

    function expand(elt) {
      if (_.isString(elt)) {
        return SmartString.setString(elt,
          Interpolate.interpolate(elt, resolveEnv, resolveConfig));
      }
      if (_.isArray(elt)) {
        return elt.map(expand);
      }
      if (_.isObject(elt)) {
        return _.mapObject(elt, expand);
      }
      return elt;
    }

    return expand(config);
  }

};

module.exports = ConfigData;
