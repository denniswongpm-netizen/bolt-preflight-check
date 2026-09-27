"use strict";

/**
 * Runs a string of JS source inside a fresh vm context, with a minimal, safe-ish set of globals
 * exposed (console, module/exports for CommonJS-style generated code). Returns the live context
 * object so a caller can run further code (e.g. a smoke test) against the SAME module.exports
 * the generated code just populated.
 *
 * ⚠️ Honest limitation, stated plainly rather than glossed over: Node's own `vm` module docs are
 * explicit that it is NOT a real security sandbox — code run this way can still escape and touch
 * the host process. This is fine for THIS demo (we control every input, both fixtures are
 * authored by us, nothing here ever runs untrusted third-party code), but a production version of
 * this idea would need real isolation (a subprocess with resource limits, or a proper sandboxing
 * service), not vm alone. Do not reuse this module to execute code from an untrusted source.
 */
const vm = require("node:vm");

function createSandbox() {
  const moduleShim = { exports: {} };
  const context = {
    module: moduleShim,
    exports: moduleShim.exports,
    console,
  };
  vm.createContext(context);
  return context;
}

function runInSandbox(context, sourceCode, filename) {
  const script = new vm.Script(sourceCode, { filename });
  return script.runInContext(context);
}

module.exports = { createSandbox, runInSandbox };
