// Real invocations of the module's own advertised API -- not a full test suite, just enough to
// actually exercise every exported function once, the same way a "does this app even run" preflight
// pass would after an AI code-generation step.
module.exports.add(2, 3);
module.exports.formatGreeting("dennis");
