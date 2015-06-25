"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var SmartString = require("../lib/smart-string.js");

describe("SmartString", function() {

  it("should smarten a relative path", function() {
    var smartStr = SmartString.smarten("mystuff", "/tmp");
    expect(smartStr)
      .to.be.instanceOf(String);
    expect(smartStr)
      .to.respondTo("getPath");
    expect(smartStr.getPath())
      .to.equal("/tmp/mystuff");
  });

  it("should smarten an absolute path", function() {
    var smartStr = SmartString.smarten("/usr/bin/node", "/tmp");
    expect(smartStr)
      .to.be.instanceOf(String);
    expect(smartStr)
      .to.respondTo("getPath");
    expect(smartStr.getPath())
      .to.equal("/usr/bin/node");
  });

  it("should pass through a smartened string", function() {
    var smartStr = SmartString.smarten("mystuff", "/tmp");
    var anotherStr = SmartString.smarten(smartStr, "/opt");
    expect(anotherStr)
      .to.be.instanceOf(String);
    expect(anotherStr)
      .to.respondTo("getPath");
    expect(anotherStr.getPath())
      .to.equal("/tmp/mystuff");
  });

});
