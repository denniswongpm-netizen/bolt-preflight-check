// A small, clean "AI-generated" module -- every helper it calls is actually defined.
function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function add(a, b) {
  return a + b;
}

function formatGreeting(name) {
  return `Hello, ${capitalize(name)}! Welcome.`;
}

module.exports = { add, formatGreeting };
