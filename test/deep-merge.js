"use strict";

var chai = require("chai");
chai.use(require("chai-subset"));
var expect = chai.expect;

var deepMerge = require("../lib/deep-merge.js");

describe("deepMerge", function() {

  it("should pass a terminal unchanged", function() {

    expect(deepMerge("Hello!"))
      .to.deep.equal("Hello!");

    expect(deepMerge(true))
      .to.deep.equal(true);

    expect(deepMerge(null))
      .to.deep.equal(null);
  });

  it("shouldn't merge terminals", function() {

    expect(deepMerge("Hello!", "Goodbye!"))
      .to.deep.equal("Hello!");

    expect(deepMerge(false, true))
      .to.deep.equal(false);

    expect(deepMerge(null, false))
      .to.deep.equal(null);

  });

  it("should merge objects", function() {

    expect(deepMerge({
        a: "a",
        c: "c"
      }, {
        b: "b",
        d: "d",
        c: "Booga!"
      }))
      .to.deep.equal({
        a: "a",
        b: "b",
        c: "c",
        d: "d"
      });

  });

  it("should append arrays", function() {
    expect(deepMerge(["a", "b", "c"], ["d", "e", "f"]))
      .to.deep.equal(
        ["a", "b", "c", "d", "e", "f"]
      );
  });

  it("shouldn't append a terminal", function() {
    expect(deepMerge(["a", "b", "c"], "d", "e"))
      .to.deep.equal(["a", "b", "c"]);
  });

  it("should merge deeply", function() {
    expect(deepMerge({
        a: "a",
        b: {
          c: "c",
          d: "d"
        },
        e: [1, 2, 3]
      }, {
        a: "a",
        b: {
          c: "e",
          f: "f"
        },
        e: ["four", "five", "six"],
        g: true
      }))
      .to.deep.equal({
        a: "a",
        b: {
          c: "c",
          d: "d",
          f: "f"
        },
        e: [1, 2, 3, "four", "five", "six"],
        g: true
      });
  });

});
