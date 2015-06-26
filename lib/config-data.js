"use strict";

var _ = require("underscore");
var deepMerge = require("./deep-merge.js");
var MultiString = require("./multi-string.js");
var SmartString = require("./smart-string.js");
var interpolate = require("./interpolate.js");

function EvalSlot(str, path) {
  this.val = str;
  this.state = "PENDING";
  this.path = path;
}

EvalSlot.prototype = {
  getCircle: function() {
    var circle = [];
    for (var slot = this; slot !== undefined; slot = slot.prev) {
      circle.unshift(slot.path);
    }
    circle.unshift(this.path);
    return circle.join(" -> ");
  }
};

EvalSlot.bless = function(elt, path) {
  if (elt instanceof EvalSlot) {
    return elt;
  }
  if (_.isString(elt)) {
    return new EvalSlot(elt, path);
  }

  if (_.isObject(elt)) {
    var cb = function(obj, idx) {
      return EvalSlot.bless(obj,
        path === undefined ? "" + idx : path + "." + idx);
    };

    if (_.isArray(elt)) {
      return elt.map(cb);
    }

    return _.mapObject(elt, cb);
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

  // TODO add defaultResolvers
  // TODO make it possible to throw on unresolved var

  expandVars: function(config, options) {
    var opt = deepMerge(options, {
      resolvers: []
    });

    var evalConfig = EvalSlot.bless(config);

    function evalSlot(slot, prev) {
      if (slot instanceof EvalSlot) {
        switch (slot.state) {
          case "RESOLVED":
            return slot.val;
          case "EVALUATING":
            throw new Error("Circular reference: " + prev.getCircle());
          case "PENDING":
            slot.state = "EVALUATING";
            slot.prev = prev;
            slot.val = SmartString.setString(slot.val,
              interpolate(slot.val,
                opt.resolvers,
                function(key) {
                  return evalSlot(ConfigData.get(evalConfig, key), slot);
                })
            );
            delete slot.prev;
            slot.state = "RESOLVED";
            return slot.val;
        }
        require("assert")
          .fail(slot.state, "RESOLVED|EVALUATING|PENDING",
            "Bad state for EvalSlot");
      }

      function evalNextSlot(nextSlot) {
        return evalSlot(nextSlot, prev);
      }

      if (_.isArray(slot)) {
        return slot.map(evalNextSlot);
      }
      if (_.isObject(slot)) {
        return _.mapObject(slot, evalNextSlot);
      }
      return slot;
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
