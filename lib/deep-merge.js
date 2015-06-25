"use strict";

var _ = require("underscore");

var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

function isArrayLike(collection) {
  if (collection === null || collection === undefined) {
    return false;
  }
  var length = collection.length;
  return typeof length === "number" &&
    length >= 0 && length <= MAX_ARRAY_INDEX;
}

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
      out = isArrayLike(obj) ? _.toArray(obj)
        .slice(0) : _.clone(obj);
      continue;
    }

    if (_.isArray(out)) {
      if (isArrayLike(obj)) {
        Array.prototype.push.apply(out, _.toArray(obj));
      } else {
        out.push(obj);
      }
      continue;
    }

    if (isTerminal(obj)) {
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

module.exports = deepMerge();
