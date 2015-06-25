"use strict";

var _ = require("underscore");

function isTerminal(obj) {
  return _.isString(obj) || _.isNumber(obj) || _.isBoolean(obj) || _.isNull(obj);
}

/**
 * Merge data structures.
 * @module configle/lib/deep-merge
 * @function
 */
function deepMerge() {
  var out;

  for (var i = 0; i < arguments.length; i++) {
    var obj = arguments[i];

    if (out === undefined) {
      if (isTerminal(obj)) {
        return obj;
      }
      out = _.isArray(obj) ? _.toArray(obj)
        .slice(0) : _.clone(obj);
      continue;
    }

    if (isTerminal(obj)) {
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

module.exports = deepMerge;
