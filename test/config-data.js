"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var ConfigData = require("../lib/config-data.js");
var SmartString = require("../lib/smart-string.js");
var errors = require("../lib/errors.js");

function toLocalPath(pathName) {
  return pathName.split("/")
    .join(require("path")
      .sep);
}

describe("ConfigData", function() {

  var config = {
    baseDir: "/tmp",
    env: {
      live: {
        db: "mysql://root@db000/live"
      },
      dev: {
        db: "mysql://root@localhost/dev",
        debug: true
      }
    },
    plugins: [{
      require: "sloth",
      options: {
        hurry: 3.2
      }
    }, {
      require: "speedy",
      options: {
        fast: true
      }
    }]
  };

  describe("walkPath", function() {

    it("should go down one level", function() {
      expect(ConfigData.walkPath(config, "baseDir"))
        .to.equal("/tmp");
    });

    it("should go down multiple levels", function() {
      expect(ConfigData.walkPath(config, "env.live.db"))
        .to.equal("mysql://root@db000/live");
    });

    it("should return undefined for missing paths", function() {
      expect(ConfigData.walkPath(config, "env.stage.db"))
        .to.equal(undefined);
    });

    it("should return undefined through terminals", function() {
      expect(ConfigData.walkPath(config, "env.live.db.flags"))
        .to.equal(undefined);
    });

    it("should return part of the structure", function() {
      expect(ConfigData.walkPath(config, "env.dev"))
        .to.deep.equal({
          db: "mysql://root@localhost/dev",
          debug: true
        });
    });

  });

  describe("get", function() {

    it("should go down one level", function() {
      expect(ConfigData.get(config, "baseDir"))
        .to.equal("/tmp");
    });

    it("should go down multiple levels", function() {
      expect(ConfigData.get(config, "env.live.db"))
        .to.equal("mysql://root@db000/live");
    });

    it("should return undefined for missing paths", function() {
      expect(ConfigData.get(config, "env.stage.db"))
        .to.equal(undefined);
    });

    it("should return undefined through terminals", function() {
      expect(ConfigData.get(config, "env.live.db.flags"))
        .to.equal(undefined);
    });

    it("should return part of the structure", function() {
      expect(ConfigData.get(config, "env.dev"))
        .to.deep.equal({
          db: "mysql://root@localhost/dev",
          debug: true
        });
    });

    it("should merge multipaths", function() {
      expect(ConfigData.get(config, "env.(live|dev)"))
        .to.deep.equal({
          db: "mysql://root@db000/live",
          debug: true
        });
    });

  });

  describe("expandVars", function() {
    it("should handle no vars", function() {
      expect(ConfigData.expandVars({
          a: "is for apple",
          b: false,
          c: null,
          d: 1.3,
          e: {},
          f: []
        }))
        .to.deep.equal({
          a: "is for apple",
          b: false,
          c: null,
          d: 1.3,
          e: {},
          f: []
        });
    });

    it("should handle simple expansion", function() {
      expect(ConfigData.expandVars({
          baseDir: "/tmp",
          workDir: "${baseDir}/work"
        }))
        .to.deep.equal({
          baseDir: "/tmp",
          workDir: "/tmp/work"
        });
    });

    it("should handle dotted paths", function() {
      expect(ConfigData.expandVars({
          dirs: {
            baseDir: "/tmp",
            workDir: "${dirs.baseDir}/work"
          }
        }))
        .to.deep.equal({
          dirs: {
            baseDir: "/tmp",
            workDir: "/tmp/work"
          }
        });
    });

    it("should handle deep refs", function() {
      expect(ConfigData.expandVars({
          foo: {
            workBase: "base",
            stage1: "${foo.workBase}/stage1",
            stage2: "${foo.stage1}/stage2",
            desc: "${bar.live}: ${bar.stage3}"
          },
          bar: {
            live: "liveProduction",
            stage3: "${foo.stage2}/stage3"
          }
        }))
        .to.deep.equal({
          foo: {
            workBase: "base",
            stage1: "base/stage1",
            stage2: "base/stage1/stage2",
            desc: "liveProduction: base/stage1/stage2/stage3"
          },
          bar: {
            live: "liveProduction",
            stage3: "base/stage1/stage2/stage3"
          }
        });
    });

    it("should splice structures", function() {
      expect(ConfigData.expandVars({
          summary: "${details}",
          details: {
            what: "details",
            desc: "It's the ${details.what}"
          }
        }))
        .to.deep.equal({
          summary: {
            what: "details",
            desc: "It's the details"
          },
          details: {
            what: "details",
            desc: "It's the details"
          }
        });

    });

    it("should resolve process.env", function() {
      process.env.CONFIGLE_TEST_VAR = "Configle!";
      expect(ConfigData.expandVars({
          name: "${CONFIGLE_TEST_VAR}"
        }, {
          expandEnv: true
        }))
        .to.deep.equal({
          name: "Configle!"
        });
    });

    it("should throw on circular refs", function() {
      expect(function() {
          ConfigData.expandVars({
            a: "${b}",
            b: "${a}"
          });
        })
        .to.throw(errors.ConfigleError);
    });

    it("should provide debug for circular refs", function() {
      expect(function() {
          ConfigData.expandVars({
            circle: {
              a: "${circle.c}",
              b: "${circle.a}",
              c: "${circle.b}"
            }
          });
        })
        .to.throw(errors.ConfigleError,
          /circle\.[abc] -> circle\.[abc] -> circle\.[abc] -> circle\.[abc]/
        );
    });

    it("should preserve SmartStrings", function() {
      var smartConfig = SmartString.smarten({
        tmpDir: ".",
        workDir: "${tmpDir}/work"
      }, "/tmp");
      var expConfig = ConfigData.expandVars(smartConfig);
      expect(expConfig.tmpDir.toPathname())
        .to.equal(toLocalPath("/tmp"));
      expect(expConfig.workDir.toPathname())
        .to.equal(toLocalPath("/tmp/work"));
    });

  });

});
