"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var Interpolate = require("../lib/interpolate.js");

describe("Interpolate", function() {

  describe("interpolate", function() {

    var interpolate = Interpolate.interpolate;

    function makeResolver(dict) {
      return function(key) {
        return dict[key];
      }
    }

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
          "Name: ${name}, dir: ${home}", look, nf))
        .to.equal("Name: Andy, dir: /home/andy");
    });

    it("should map $$ to $", function() {
      expect(interpolate("Worth at least $$1000!"))
        .to.equal("Worth at least $1000!");
    });

    it("should do recursive interpolation", function() {
      expect(interpolate("Name: ${{useName}}", look, nf))
        .to.equal("Name: Andrew");
    });

    it("should try multiple resolvers", function() {
      expect(interpolate(
          "name: ${name}, desc: ${desc}", look, look2, nf))
        .to.equal("name: Andy, desc: Biffo the bear");
    });

    it("should return an object for the entire string", function() {
      expect(interpolate(
          "${data}", look, nf))
        .to.deep.equal({
          an: "Object"
        });
    });

    it("should return an object for a recursive lookup", function() {
      expect(interpolate(
          "${{dataField}}", look, nf))
        .to.deep.equal({
          an: "Object"
        });
    });

    it("should stringify embedded objects", function() {
      expect(interpolate(
          "data: ${data}", look, nf))
        .to.deep.equal("data: [object Object]");
    });

  });

});
