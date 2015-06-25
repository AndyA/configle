"use strict";

var _ = require("underscore");

var Interpolate = {

  interpolate: function() {
    var resolvers = _.toArray(arguments);
    var str = resolvers.shift();

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

        out.push(next);
      }
      return out.join("");
    }
    return interp("${");
  }

};

module.exports = Interpolate;
