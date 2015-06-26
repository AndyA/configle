"use strict";

var _ = require("underscore");

/**
 * Generate permutations of strings based on a specification
 * @module configle/lib/multi-string
 */

/**
 * @param {String} spec  - the specification
 * @class
 */

function MultiString(spec) {
  this.spec = spec;
  this.multi = MultiString.parseMulti(spec);
}

/**
 * Parse a multistring.
 * @param  {string} str The string to parse
 * @return {Object}     An object representing the multistring.
 */
MultiString.parseMulti = function(str) {
  var tokens = _.filter(str.split(/([.(|)])/), function(tok) {
    return tok.length;
  });

  var isWord = /^[-\w\d]+/;

  function syntaxError(msg) {
    throw new Error(msg + " " +
      (tokens.length ? ("'" + tokens[0] + "'") : "nothing"));
  }

  function expected(what) {
    syntaxError("Expected " + what + ", got");
  }

  function parseWords() {
    if (!tokens.length || !isWord.test(tokens[0])) {
      return [];
    }

    var out = [tokens.shift()];
    while (tokens.length >= 2 && tokens[0] === "." && isWord.test(tokens[1])) {
      tokens.shift();
      out.push(tokens.shift());
    }

    return out.join(".");
  }

  function parseAlternation() {
    var out = [];

    function add(term) {
      if (_.isArray(term) && term.length === 1) {
        out.push(term[0]);
      } else {
        out.push(term);
      }
    }

    add(parseExpression()); // eslint-disable-line no-use-before-define

    while (tokens.length && tokens[0] === "|") {
      tokens.shift();
      add(parseExpression()); // eslint-disable-line no-use-before-define
    }
    if (out.length === 1) {
      return out[0];
    }
    return {
      alt: out
    };
  }

  function parseExpression() {
    var out = [];

    while (tokens.length) {
      if (tokens[0] === "(") {
        tokens.shift();
        out.push(parseAlternation());
        if (!tokens.length || tokens[0] !== ")") {
          expected("')'");
        }
        tokens.shift();
      } else {
        out.push(parseWords());
      }
      if (tokens.length && tokens[0] !== ".") {
        break;
      }
      tokens.shift();
    }
    return out;
  }

  var out = parseExpression();

  if (tokens.length) {
    syntaxError("Syntax error:");
  }

  return out;
};

MultiString.prototype = {
  /**
   * @callback eachCallback
   * @param {string} str - The string permutation
   */

  /**
   * Call the supplied function with each possible permutation of the value.
   *
   * @param {eachCallback} callback
   *           - Function to call with each permutation
   * @param {object} [thisArg]
   *           - Value to use as <tt>this</tr> when executing <tt>callback</tt>
   */
  each: function(callback, thisArg) {
    var stop = false;
    var path = [];

    function visit(multi, next) {
      if (stop) {
        return;
      }
      if (_.isString(multi)) {
        path.push(multi);
        next();
        path.pop();
        return;
      }

      if (_.isArray(multi)) {
        if (multi.length === 0) {
          next();
          return;
        }
        var tail = multi.slice(0);
        var head = tail.shift();
        visit(head, function() {
          visit(tail, next);
        });

        return;
      }

      if (!multi.hasOwnProperty("alt")) {
        throw new Error("Malformed multi: missing 'alt' key in object");
      }

      var alt = multi.alt;
      for (var i = 0; !stop && i < alt.length; i++) {
        visit(alt[i], next);
      }
    }

    visit(this.multi, function() {
      if (callback.call(thisArg, path.join(".")) === true) {
        stop = true;
      }
    });
  }

};

module.exports = MultiString;
