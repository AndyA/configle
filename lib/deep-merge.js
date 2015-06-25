"use strict";

var _ = require("underscore");

function isTerminal(obj) {
  return _.isString(obj) || _.isNumber(obj) || _.isBoolean(obj) || _.isNull(obj);
}

var deepMerge;

function deepMergeArray(objs) {
  var out;

  var stopAt = null;
  if (objs.length && objs[objs.length - 1] instanceof Function) {
    stopAt = objs.pop();
  }

  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    if (obj === undefined) {
      continue;
    }

    if (out === undefined) {
      if (isTerminal(obj) || (stopAt !== null && stopAt(obj))) {
        return obj;
      }
      out = _.isArray(obj) ? _.toArray(obj)
        .slice(0) : _.clone(obj);
      continue;
    }

    if (isTerminal(obj) || (stopAt !== null && stopAt(obj))) {
      continue;
    }

    if (_.isArray(obj)) {
      if (_.isArray(out)) {
        Array.prototype.push.apply(out, _.toArray(obj));
      }
      continue;
    }

    _.each(obj, function(elt, key) {
      if (out.hasOwnProperty(key)) {
        out[key] = deepMerge(out[key], elt);
      } else {
        out[key] = elt;
      }
    });

  }

  return out;
}

/**
 * Merge data structures.
 *
 * @module configle/lib/deep-merge
 * @function
 *
 * @param {...*}
 *           - The objects to merge.
 * @returns {*}
 *           - The merged object. None of the input objects are modified.
 */
deepMerge = function() {
  return deepMergeArray(_.toArray(arguments));
};

deepMerge.array = function(objs) {
  return deepMergeArray(objs);
};

module.exports = deepMerge;
