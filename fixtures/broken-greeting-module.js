// The exact bug class this whole repo exists to catch: `capitalize` reads like a real helper
// function, but it was never actually defined anywhere in this file. The module loads fine (JS
// doesn't check this until the code path actually runs) -- it only breaks the moment
// formatGreeting() is actually called, which is exactly why a static "does it look right" read
// isn't enough.
function add(a, b) {
  return a + b;
}

function formatGreeting(name) {
  return `Hello, ${capitalize(name)}! Welcome.`;
}

module.exports = { add, formatGreeting };
