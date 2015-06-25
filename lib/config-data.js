"use strict";

var _ = require("underscore");
var deepMerge = require("./deep-merge.js");
var MultiString = require("./multi-string.js");
var SmartString = require("./smart-string.js");
var Interpolate = require("./interpolate.js");

function EvalSlot(str) {
  this.val = str;
  this.state = "PENDING";
}

EvalSlot.bless = function(elt) {
  if (elt instanceof EvalSlot) {
    return elt;
  }
  if (_.isString(elt)) {
    return new EvalSlot(elt);
  }
  if (_.isArray(elt)) {
    return elt.map(EvalSlot.bless);
  }
  if (_.isObject(elt)) {
    return _.mapObject(elt, EvalSlot.bless);
  }
  return elt;
};

var ConfigData = {

  walkPath: function(data, pathSpec) {
    if (pathSpec.length === 0) {
      return undefined;
    }
    var path = pathSpec.split(".");
    for (var i = 0; i < path.length; i++) {
      if (data instanceof EvalSlot || !_.isObject(data)) {
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
      out = deepMerge(out, val, function(obj) {
        return obj instanceof EvalSlot;
      });
    });
    return out;
  },

  expandVars: function(config) {
    var evalConfig = EvalSlot.bless(config);

    function resolveEnv(key) {
      return process.env[key];
    }

    function evalSlot(slot) {
      if (slot instanceof EvalSlot) {
        switch (slot.state) {
          case "RESOLVED":
            return slot.val;
          case "EVALUATING":
            throw new Error("Circular reference");
          case "PENDING":
            slot.state = "EVALUATING";
            slot.val = SmartString.setString(slot.val,
              Interpolate.interpolate(slot.val,
                resolveEnv, resolveConfig) // eslint-disable-line no-use-before-define
            );
            slot.state = "RESOLVED";
            return slot.val;
        }
        throw new Error("What?!");
      }
      if (_.isArray(slot)) {
        return slot.map(evalSlot);
      }
      if (_.isObject(slot)) {
        return _.mapObject(slot, evalSlot);
      }
      return slot;
    }

    // TODO recursive resolution
    function resolveConfig(key) {
      return evalSlot(ConfigData.get(evalConfig, key));
    }

    function expand(elt) {
      if (_.isString(elt)) {
        return elt;
      }
      if (elt instanceof EvalSlot) {
        return evalSlot(elt);
      }
      if (_.isArray(elt)) {
        return elt.map(expand);
      }
      if (_.isObject(elt)) {
        return _.mapObject(elt, expand);
      }
      return elt;
    }

    return expand(evalConfig);
  }

};

module.exports = ConfigData;
