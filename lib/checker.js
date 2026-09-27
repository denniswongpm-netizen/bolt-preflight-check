"use strict";

/**
 * The actual preflight check: load a generated module into a sandbox, then run a small set of
 * real smoke-test invocations against its exported API, and report exactly what broke -- never a
 * bare pass/fail.
 *
 * Why this catches the bug class it's meant to catch: JavaScript doesn't statically flag a
 * reference to an undefined name the way a typed language's compiler would -- a call to a helper
 * function the generator forgot to define parses just fine and only throws a real ReferenceError
 * once that code path actually EXECUTES. So the only reliable way to catch it without a full
 * static analyzer is to actually run the code, not just eyeball or lint it. This mirrors the same
 * principle used elsewhere in generated-content pipelines: a claim (here, "this function works")
 * isn't trusted just because it reads correctly -- it's independently re-checked against reality.
 */
const { createSandbox, runInSandbox } = require("./sandbox");

function runPreflightCheck(generatedSource, smokeTestSource, filename = "generated-module.js") {
  const issues = [];
  const context = createSandbox();

  try {
    runInSandbox(context, generatedSource, filename);
  } catch (err) {
    issues.push({
      stage: "load",
      message: `Generated module failed to load at all: ${err.name}: ${err.message}`,
    });
    // No point running smoke tests against a module that never even loaded.
    return { passed: false, issues };
  }

  try {
    runInSandbox(context, smokeTestSource, "smoke-tests.js");
  } catch (err) {
    issues.push({
      stage: "smoke_test",
      message: `A smoke-test call failed against the loaded module: ${err.name}: ${err.message}`,
    });
  }

  return { passed: issues.length === 0, issues };
}

module.exports = { runPreflightCheck };
