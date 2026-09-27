"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { runPreflightCheck } = require("../lib/checker");
const { runPipeline } = require("../lib/pipeline");

const FIXTURES = path.join(__dirname, "..", "fixtures");
const read = (name) => fs.readFileSync(path.join(FIXTURES, name), "utf8");

const SMOKE_TEST = read("greeting-module.smoketest.js");

test("a genuinely clean generated module passes preflight", () => {
  const result = runPreflightCheck(read("good-greeting-module.js"), SMOKE_TEST);
  assert.equal(result.passed, true);
  assert.deepEqual(result.issues, []);
});

test("a module with an undefined-reference bug is caught, not silently accepted", () => {
  const result = runPreflightCheck(read("broken-greeting-module.js"), SMOKE_TEST);
  assert.equal(result.passed, false);
  assert.equal(result.issues.length, 1);
  assert.match(result.issues[0].message, /ReferenceError/);
  assert.match(result.issues[0].message, /capitalize/);
});

test("a module that fails to load at all is reported at the load stage, not smoke_test", () => {
  const brokenSyntax = "function add(a, b) { return a +; }"; // deliberate syntax error
  const result = runPreflightCheck(brokenSyntax, SMOKE_TEST);
  assert.equal(result.passed, false);
  assert.equal(result.issues[0].stage, "load");
});

test("a module that loads but whose export isn't callable is caught as a smoke_test failure", () => {
  const wrongShape = "module.exports = { add: 'not a function', formatGreeting: () => '' };";
  const result = runPreflightCheck(wrongShape, SMOKE_TEST);
  assert.equal(result.passed, false);
  assert.equal(result.issues[0].stage, "smoke_test");
  assert.match(result.issues[0].message, /TypeError/);
});

test("runPipeline() end-to-end against the real fixture files on disk", () => {
  const goodResult = runPipeline(
    path.join(FIXTURES, "good-greeting-module.js"),
    path.join(FIXTURES, "greeting-module.smoketest.js"),
  );
  assert.equal(goodResult.passed, true);

  const brokenResult = runPipeline(
    path.join(FIXTURES, "broken-greeting-module.js"),
    path.join(FIXTURES, "greeting-module.smoketest.js"),
  );
  assert.equal(brokenResult.passed, false);
});

test("a missing file is reported as an issue, not an uncaught crash", () => {
  const result = runPipeline("/nonexistent/module.js", "/nonexistent/smoketest.js");
  assert.equal(result.passed, false);
  assert.equal(result.issues[0].stage, "read");
});
