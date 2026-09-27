"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { runPreflightCheck } = require("./checker");

function runPipeline(modulePath, smokeTestPath) {
  let generatedSource;
  let smokeTestSource;
  try {
    generatedSource = fs.readFileSync(modulePath, "utf8");
    smokeTestSource = fs.readFileSync(smokeTestPath, "utf8");
  } catch (err) {
    return { passed: false, issues: [{ stage: "read", message: err.message }] };
  }
  return runPreflightCheck(generatedSource, smokeTestSource, path.basename(modulePath));
}

function main() {
  const [, , modulePath, smokeTestPath] = process.argv;
  if (!modulePath || !smokeTestPath) {
    console.error("Usage: node lib/pipeline.js <generated-module.js> <smoketest.js>");
    process.exit(1);
  }

  const result = runPipeline(modulePath, smokeTestPath);
  if (result.passed) {
    console.log(`✅ ${modulePath} passed preflight — every smoke-test call ran clean.`);
  } else {
    console.log(`❌ ${modulePath} FAILED preflight:`);
    for (const issue of result.issues) {
      console.log(`  [${issue.stage}] ${issue.message}`);
    }
    process.exit(1);
  }
}

module.exports = { runPipeline };

if (require.main === module) {
  main();
}
