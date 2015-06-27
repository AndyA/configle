"use strict";

var path = require("path");
var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var YAML = require("yamljs");

var Configle = require("../lib/configle-core.js");
var errors = require("../lib/errors.js");

function toLocalPath(pathName) {
  return pathName.split("/")
    .join(require("path")
      .sep);
}

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
      startDir: "/tmp"
    }, {
      expandVars: false
    });

    it("should have the right options", function() {
      expect(cf.getOptions())
        .to.deep.equal({
          startDir: "/tmp",
          expandVars: false,
          expandEnv: true,
          allowUndefined: false,
          resolvers: [],
          defaultResolvers: [],
          loaders: {
            json: JSON.parse,
            yml: YAML.parse,
            yaml: YAML.parse
          }
        });
    });

    it("should no longer allow options to be set", function() {
      expect(function() {
          cf.options({});
        })
        .to.throw(errors.ConfigleCoreError);
    });
  });

  describe("config", function() {
    var cf = new Configle();

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

  describe("functions", function() {
    var cf = new Configle();

    cf.addConfig({
      inHomeMe: "home_me",
      fromHomeYou: "Path: ${path:{inHomeYou}}"
    }, "/home/me");

    cf.addConfig({
      inHomeYou: "home_you",
      fromHomeMe: "Path: ${path:{inHomeMe}}"
    }, "/home/you");

    it("should evaluate the path function", function() {
      expect(cf.get())
        .to.deep.equal({
          inHomeMe: "home_me",
          fromHomeYou: "Path: " +
            toLocalPath("/home/you/home_you"),
          inHomeYou: "home_you",
          fromHomeMe: "Path: " +
            toLocalPath("/home/me/home_me")
        });
    });

  });

  ["json", "yaml"].forEach(function(kind) {
    describe("load " + kind, function() {
      var cfgRoot = path.join(__dirname, "data", kind, "root");
      var cfgHome = path.join(cfgRoot, "home", "me");
      var cfgStart = path.join(cfgHome, "projects");

      var cf = new Configle({
        startDir: cfgStart
      });

      it("should load config", function() {
        expect(cf.load("configle.(local|)"))
          .to.deep.equal({
            "name": "Projects local config",
            "vars": {
              "array": [],
              "false": false,
              "null": null,
              "object": {
                "false": false,
                "null": null,
                "pi": 3.1415,
                "true": true
              },
              "pi": 3.1415,
              "true": true
            },
            "sources": [
              "projects local",
              "projects",
              "home local",
              "home",
              "root local",
              "root"
            ],
            "here": [".", ".", ".", ".", ".", "."]
          });
      });

      it("should resolve pathnames", function() {
        expect(cf.getPathname("here"))
          .to.deep.equal([
            cfgStart, cfgStart,
            cfgHome, cfgHome,
            cfgRoot, cfgRoot
          ]);
      });
    });
  });

});
