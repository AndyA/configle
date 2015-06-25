"use strict";

var _ = require("underscore");

var Interpolate = {

  interpolate: function() {
    var args = _.toArray(arguments);
    var str = args.shift();
    var resolvers = _.flatten(args);

    function resolve(expr) {
      for (var i = 0; i < resolvers.length; i++) {
        var val = resolvers[i](expr);
        if (val !== undefined) {
          return val;
        }
      }
    }

    var tokens = str.split(/(\$\{|\$\$|\{|\})/);

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
            throw new Error("Missing '}'");
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
      if (out.length === 1) {
        return out[0];
      }
      return out.map(function(elt) {
          return elt.toString();
        })
        .join("");
    }
    return interp("${");
  }

};

module.exports = Interpolate;
