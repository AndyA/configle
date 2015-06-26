"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var Configle = require("../");

describe("Configle", function() {

  it("should handle its static methods", function() {
    ["load"].forEach(function(method) {
      expect(Configle)
        .itself.to.respondTo(method);
    });
  });

  it("should handle its utility static methods", function() {
    ["deepMerge", "interpolate"].forEach(function(method) {
      expect(Configle)
        .itself.to.respondTo(method);
    });
  });

});
