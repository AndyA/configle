"use strict";
var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var Configle = require("../lib/configle-core.js");

describe("Configle core", function() {

  it("should handle its static methods", function() {
    ["load"].forEach(function(method) {
      expect(Configle)
        .itself.to.respondTo(method);
    });
  });

});
