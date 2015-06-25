"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var ConfigData = require("../lib/config-data.js");

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

});
