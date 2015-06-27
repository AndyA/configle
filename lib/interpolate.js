"use strict";

var _ = require("underscore");
var errors = require("./errors.js");

/**
 * Expand embedded variable references in a string.
 * 
 * @param  {string} str       
 *          - a string that may contain ${...} placeholders.
 * @param  {function[]} resolvers 
 *          - an array of resolver functions called in order to get the replacement text.
 * @param  {*} attr      
 *         - Arbitrary attributes object which is passed to each of the resolvers.
 * @return {string|object}
 *         - The expanded string.
 */
module.exports = function(str, resolvers, attr) {
  resolvers = _.flatten(resolvers);
  var isFunc = /^(\w+)$/;

  function flatten(chunk) {
    if (chunk.length === 1) {
      return chunk[0];
    }
    return chunk.map(function(elt) {
        return elt.toString();
      })
      .join("");
  }

  function resolve(chunk) {
    var expr = flatten(chunk);
    var context = {
      chunk: chunk,
      resolve: resolve,
      attr: attr
    };

    if (chunk.length > 1 && isFunc.test(chunk[0]) && chunk[1] === ":") {
      context.func = {
        name: chunk[0],
        arg: flatten(chunk.slice(2))
      };
    }

    for (var i = 0; i < resolvers.length; i++) {
      var val = resolvers[i](expr, context);
      if (val !== undefined) {
        return val;
      }
    }
  }

  var tokens = str.split(/(\$\{|\$\$|\{|\}|:)/);

  function interp(startToken, endToken) {
    var out = [];
    while (tokens.length) {
      var next = tokens.shift();
      if (endToken !== undefined && next === endToken) {
        tokens.unshift(next);
        break;
      }

      if (next === "$$") {
        out.push("$");
        continue;
      }

      if (next === startToken) {
        var inner = interp("{", "}");
        if (!tokens.length || tokens[0] !== "}") {
          throw new errors.SyntaxError("Missing '}'");
        }
        tokens.shift();
        var val = resolve(inner);
        if (val !== undefined) {
          out.push(val);
        }
        continue;
      }

      if (next.length !== 0) {
        out.push(next);
      }
    }
    return out;
  }
  return flatten(interp("${"));

};
