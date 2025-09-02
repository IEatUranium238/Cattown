const { default: returnHTML } = require('../src/cattownMain');

test('Plain text', () => {
  expect(returnHTML("hi")).toBe("<p class=\"ct-parsed paragraph\">hi</p>");
});