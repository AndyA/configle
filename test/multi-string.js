"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var MultiString = require("../lib/multi-string.js");

describe("MultiString", function() {

  describe("parseMulti", function() {

    it("should not split the parts of a dotted string", function() {

      expect(MultiString.parseMulti("this.and.that"))
        .to.deep.equal(["this.and.that"]);

    });

    it("should handle a no-op alternation", function() {

      expect(MultiString.parseMulti("(and.or)"))
        .to.deep.equal(["and.or"]);
    });

    it("should handle a simple alternation", function() {

      expect(MultiString.parseMulti("(and|or)"))
        .to.deep.equal([{
          alt: ["and", "or"]
        }]);
    });

    it("should handle an embedded alternation", function() {

      expect(MultiString.parseMulti("this.(and|or).that"))
        .to.deep.equal(["this", {
          alt: ["and", "or"]
        }, "that"]);
    });

    it("should handle nested alternations", function() {

      expect(MultiString.parseMulti(
          "this.(and|or.(that|the.other))"))
        .to.deep.equal(["this", {
          alt: ["and", ["or", {
            alt: ["that", "the.other"]
          }]]
        }]);
    });

    it("should handle sequential alternations", function() {

      expect(MultiString.parseMulti(
          "this.(and|or).(that|the.other)"))
        .to.deep.equal(["this", {
          alt: ["and", "or"]
        }, {
          alt: ["that", "the.other"]
        }]);

    });

    it("should handle empty elements in alternations", function() {

      expect(MultiString.parseMulti("this.(|and|or).that"))
        .to.deep.equal(["this", {
          alt: [
            [], "and", "or"
          ]
        }, "that"]);

    });

  });

  function runEach(spec, stop) {
    var ms = new MultiString(spec);
    var out = [];
    ms.each(function(path) {
      out.push(path);
      return (stop !== undefined && out.length === stop);
    });
    return out;
  }

  describe("each", function() {

    it("should handle a single word", function() {
      expect(runEach("this"))
        .to.deep.equal(["this"]);
    });

    it("should handle a simple alternation", function() {
      expect(runEach("(this|that)"))
        .to.deep.equal(["this", "that"]);
    });

    it("should handle an embedded alternation", function() {
      expect(runEach("choose.(this|that).now"))
        .to.deep.equal(["choose.this.now", "choose.that.now"]);
    });

    it("should handle an empty alternative", function() {
      expect(runEach("choose.(|this|that).now"))
        .to.deep.equal(
          ["choose.now", "choose.this.now", "choose.that.now"]);
    });

    it("should handle sequential alternations", function() {
      expect(runEach("(this|that).(is|was)"))
        .to.deep.equal(
          ["this.is", "this.was", "that.is", "that.was"]);
    });

    it("should handle nested alternations", function() {
      expect(runEach("a.(b.(c|d)|(e|f).g).h"))
        .to.deep.equal(
          ["a.b.c.h", "a.b.d.h", "a.e.g.h", "a.f.g.h"]);
    });

    it("it should stop when the callback returns true", function() {
      expect(runEach("a.((b|c).(d|e)|(f|g).(h|i)).j", 7))
        .to.deep.equal(
          ["a.b.d.j", "a.b.e.j", "a.c.d.j", "a.c.e.j", "a.f.h.j",
            "a.f.i.j", "a.g.h.j"
          ]);

    });

  });

});
