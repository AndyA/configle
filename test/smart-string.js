"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var SmartString = require("../lib/smart-string.js");

//function toLocalPath(pathName) {
//  return pathName.split("/")
//    .join(require("path")
//      .sep);
//}

describe("SmartString", function() {

  describe("smarten", function() {

    it("should smarten a relative path", function() {
      var smartStr = SmartString.smarten("mystuff", "/tmp");
      expect(smartStr)
        .to.be.instanceOf(String);
      expect(smartStr)
        .to.respondTo("toPathname");
      expect(smartStr.toPathname())
        .to.equal("/tmp/mystuff");
    });

    it("should smarten an absolute path", function() {
      var smartStr = SmartString.smarten("/usr/bin/node", "/tmp");
      expect(smartStr)
        .to.be.instanceOf(String);
      expect(smartStr)
        .to.respondTo("toPathname");
      expect(smartStr.toPathname())
        .to.equal("/usr/bin/node");
    });

    it("should pass through a smartened string", function() {
      var smartStr = SmartString.smarten("mystuff", "/tmp");
      var anotherStr = SmartString.smarten(smartStr, "/opt");
      expect(anotherStr)
        .to.be.instanceOf(String);
      expect(anotherStr)
        .to.respondTo("toPathname");
      expect(anotherStr.toPathname())
        .to.equal("/tmp/mystuff");
    });

  });

  /* eslint-disable no-unused-expressions */

  describe("staySmart", function() {

    function filt() {
      return "foo";
    }

    it("should not smarten a non-smart string", function() {
      var str = "Hello, World\n";
      var filtStr = SmartString.staySmart(str, filt);
      expect(SmartString.isSmart(filtStr))
        .to.be.false;
    });

    it("should retain the smarts of a smart string", function() {
      var smartStr = SmartString.smarten("${ENV}", "/tmp");
      var filtStr = SmartString.staySmart(smartStr, filt);
      expect(SmartString.isSmart(filtStr))
        .to.be.true;
      expect(filtStr.toPathname())
        .to.equal("/tmp/foo");
    });
  });

  describe("setString", function() {

    it("should not smarten a non-smart string", function() {
      var str = "Hello, World\n";
      var filtStr = SmartString.setString(str, "foo");
      expect(SmartString.isSmart(filtStr))
        .to.be.false;
    });

    it("should retain the smarts of a smart string", function() {
      var smartStr = SmartString.smarten("${ENV}", "/tmp");
      var filtStr = SmartString.setString(smartStr, "foo");
      expect(SmartString.isSmart(filtStr))
        .to.be.true;
      expect(filtStr.toPathname())
        .to.equal("/tmp/foo");
    });

  });

});
