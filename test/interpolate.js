"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var interpolate = require("../lib/interpolate.js");

function makeResolver(dict) {
  return function(key) {
    return dict[key];
  };
}

describe("interpolate", function() {

  describe("variable expansion", function() {

    var look = makeResolver({
      name: "Andy",
      altName: "Andrew",
      home: "/home/andy",
      useName: "altName",
      data: {
        an: "Object"
      },
      dataField: "data"
    });

    var look2 = makeResolver({
      name: "Biffo",
      desc: "Biffo the bear"
    });

    function nf(key) {
      throw new Error(key + " not found");
    }

    it("should pass through a plain string", function() {
      expect(interpolate("Hello, World!"))
        .to.equal("Hello, World!");
    });

    it("should do simple interpolation", function() {
      expect(interpolate(
          "Name: ${name}, dir: ${home}", [look, nf]))
        .to.equal("Name: Andy, dir: /home/andy");
    });

    it("should map $$ to $", function() {
      expect(interpolate("Worth at least $$1000!"))
        .to.equal("Worth at least $1000!");
    });


    it("should escape $${", function() {
      expect(interpolate("A variable ref looks like this: $${var}"))
        .to.equal("A variable ref looks like this: ${var}");
    });

    it("should ignore { at the top level", function() {
      expect(interpolate("open brace: {"))
        .to.equal("open brace: {");
    });

    it("should ignore } at the top level", function() {
      expect(interpolate("closing brace: }"))
        .to.equal("closing brace: }");
    });

    it("should do recursive interpolation", function() {
      expect(interpolate("Name: ${{useName}}", [look, nf]))
        .to.equal("Name: Andrew");
    });

    it("should try multiple resolvers", function() {
      expect(interpolate(
          "name: ${name}, desc: ${desc}", [look, look2, nf]))
        .to.equal("name: Andy, desc: Biffo the bear");
    });

    it("should return an object for the entire string", function() {
      expect(interpolate(
          "${data}", [look, nf]))
        .to.deep.equal({
          an: "Object"
        });
    });

    it("should return an object for a recursive lookup", function() {
      expect(interpolate(
          "${{dataField}}", [look, nf]))
        .to.deep.equal({
          an: "Object"
        });
    });

    it("should stringify embedded objects", function() {
      expect(interpolate(
          "data: ${data}", [look, nf]))
        .to.deep.equal("data: [object Object]");
    });
  });

  describe("user defined functions", function() {

    function userFuncs(expr, context) {

      if (context.func) {
        var func = context.func;
        switch (func.name) {
          case "length":
            return func.arg.length;
          case "double":
            return func.arg + func.arg;
        }
      }

      return undefined;
    }

    var vars = makeResolver({
      "v1": "A string of some sort",
      "v2": 10,
      "name": "Andy",
      "vector": [1, 2, 3]
    });

    it("should call a function", function() {
      expect(interpolate("${length:123}", [userFuncs, vars]))
        .to.equal(3);
    });

    it("should call a function with an expanded arg", function() {
      expect(interpolate("${length:{v1}}", [userFuncs, vars]))
        .to.equal("A string of some sort".length);
    });

    it("should call a function with an object", function() {
      expect(interpolate("${length:{vector}}", [userFuncs, vars]))
        .to.equal(3);
    });

    it("should allow polymorphic functions", function() {
      expect(interpolate("${double:{name}}", [userFuncs, vars]))
        .to.equal("AndyAndy");
      expect(interpolate("${double:{v2}}", [userFuncs, vars]))
        .to.equal(20);
    });

  });
});
