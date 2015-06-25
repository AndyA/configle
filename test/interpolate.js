"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var Interpolate = require("../lib/interpolate.js");

describe("Interpolate", function() {

  describe("interpolate", function() {

    var interpolate = Interpolate.interpolate;

    var dict = {
      name: "Andy",
      altName: "Andrew",
      home: "/home/andy",
      useName: "altName"
    };

    function look(key) {
      return dict[key];
    }

    function nf(key) {
      throw new Error(key + " not found");
    }

    it("should pass through a plain string", function() {
      expect(interpolate("Hello, World!"))
        .to.equal("Hello, World!");
    });

    it("should do simple interpolation", function() {
      expect(interpolate("Name: ${name}, dir: ${home}", look, nf))
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

  });

});
