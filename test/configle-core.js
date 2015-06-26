"use strict";
var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var Configle = require("../lib/configle-core.js");

describe("Configle core", function() {

  describe("interface", function() {
    it("should handle its static methods", function() {
      ["load", "defaultOptions"].forEach(function(method) {
        expect(Configle)
          .itself.to.respondTo(method);
      });
    });

    it("should handle its methods", function() {
      ["get", "options", "getOptions",
        "addConfig", "loadFile", "load"
      ]
      .forEach(
        function(method) {
          expect(Configle)
            .to.respondTo(method);
        });
    });
  });

  describe("options", function() {
    var cf = new Configle({
      startDir: ".."
    });

    cf.options({
      startDir: "/tmp",
      smartStrings: false
    }, {
      expandVars: false
    });

    it("should have the right options", function() {
      expect(cf.getOptions())
        .to.deep.equal({
          startDir: "/tmp",
          smartStrings: false,
          expandVars: false,
          expandEnv: true,
          allowUndefined: false,
          loaders: {
            json: JSON.parse
          }
        });
    });

    it("should no longer allow options to be set", function() {
      expect(function() {
          cf.options({});
        })
        .to.throw(Error);
    });
  });

  describe("config", function() {
    var cf = new Configle({
      smartStrings: false
    });

    cf.addConfig({
      db: {
        test: "mysql://root@localhost/test",
        live: "mysql://root@localhost/live"
      }
    }, "/home/me");

    cf.addConfig({
      db: {
        test: "mysql://root@db000/test",
        stage: "mysql://root@db000/stage",
        live: "mysql://root@db000/live"
      }
    }, "/tmp");

    it("should have config", function() {
      expect(cf.get())
        .to.deep.equal({
          db: {
            test: "mysql://root@localhost/test",
            stage: "mysql://root@db000/stage",
            live: "mysql://root@localhost/live"
          }
        });
    });
  });

});
