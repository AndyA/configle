"use strict";

var _ = require("underscore");
var deepMerge = require("./deep-merge.js");
var MultiString = require("./multi-string.js");
var SmartString = require("./smart-string.js");
var Interpolate = require("./interpolate.js");

function EvalSlot(str, path) {
  this.val = str;
  this.state = "PENDING";
  if (path !== undefined) {
    this.path = path.join(".");
  }
}

EvalSlot.prototype = {
  getCircle: function() {
    var circle = [];
    for (var slot = this; slot !== undefined; slot = slot.prev) {
      if (slot.path === undefined) {
        return "(no information available; enable trackRefs to debug)";
      }
      circle.unshift(slot.path);
    }
    circle.unshift(this.path);
    return circle.join(" -> ");
  }
};

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

EvalSlot.blessTracked = function(elt, path) {
  if (elt instanceof EvalSlot) {
    return elt;
  }
  if (_.isString(elt)) {
    return new EvalSlot(elt, path);
  }
  var nextPath, out;
  if (_.isArray(elt)) {
    nextPath = path ? path.slice(0) : [];
    nextPath.push("");
    out = [];
    for (var i = 0; i < elt.length; i++) {
      nextPath[nextPath.length - 1] = i;
      out.push(EvalSlot.blessTracked(elt[i], nextPath));
    }
    return out;
  }
  if (_.isObject(elt)) {
    nextPath = path ? path.slice(0) : [];
    nextPath.push("");
    out = {};
    _.each(elt, function(val, key) {
      nextPath[nextPath.length - 1] = key;
      out[key] = EvalSlot.blessTracked(val, nextPath);
    });
    return out;
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

  expandVars: function(config, options) {
    var opt = deepMerge(options, {
      trackRefs: false,
      resolvers: []
    });

    var evalConfig = opt.trackRefs ?
      EvalSlot.blessTracked(config) : EvalSlot.bless(config);

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
              Interpolate.interpolate(slot.val,
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
