/**
 * Hello module - simple example
 */

function greet(name) {
  if (!name) {
    throw new Error('Name is required');
  }
  return `Hello, ${name}!`;
}

function add(a, b) {
  return a + b;
}

module.exports = { greet, add };
