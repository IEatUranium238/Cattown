/**
 * CATTOWN VISUAL TESTS
 * 
 * This test suite validates the visual output of the Cattown markdown parser.
 * It tests the core returnHTML function to ensure markdown syntax is correctly
 * converted to the expected HTML structure.
 * 
 * Test Configuration:
 * - Mock configuration disables debug mode and sanitization for predictable output
 * - Tests focus on output correctness rather than internal behavior
 * - Each test validates a specific markdown feature or combination
 * 
 * Coverage Areas:
 * - Basic text formatting (bold, italic, combinations)
 * - Links and images
 * - Edge cases (empty input)
 * - Nested formatting scenarios
 */

import returnHTML from "../src/cattownMain";

// Mock the configuration to ensure consistent, predictable test results
jest.mock("../src/cattownConfig.json", () => ({
  debugMode: false,         // Disable debug logging for clean test output
  enableSanitization: false, // Disable sanitization to test raw HTML generation
}));

describe("returnHTML visual tests (markdown to HTML output)", () => {
  // Test basic paragraph creation from plain text
  test("simple paragraph", () => {
    const md = "Hi";
    const html = returnHTML(md);
    expect(html).toBe("<p>Hi</p>");
  });

  // Edge case: empty input should return empty output
  test("empty markdown input results in empty string", () => {
    const md = "";
    const html = returnHTML(md);
    expect(html).toBe("");
  });

  // Test all basic inline formatting options with both marker styles
  test("markdown with basic formatting", () => {
    const md = "**bold** *italic* __bold__ _italic_";
    const html = returnHTML(md);
    expect(html).toBe(
      "<p><strong>bold</strong> <em>italic</em> <strong>bold</strong> <em>italic</em></p>"
    );
  });

  // Complex test: nested formatting combinations to verify proper precedence and nesting
  test("markdown with mixed basic formatting", () => {
    const md =
      "**Bold _and italic_ text** *italic __and bold__ text* __Bold *and italic* text__ _italic **and bold** text_";
    const html = returnHTML(md);
    expect(html).toBe(
      "<p><strong>Bold <em>and italic</em> text</strong> <em>italic <strong>and bold</strong> text</em> <strong>Bold <em>and italic</em> text</strong> <em>italic <strong>and bold</strong> text</em></p>"
    );
  });

  // Test link parsing with proper href attribute generation
  test("markdown with inline link to google", () => {
    const md = "[Google](https://www.google.com)";
    const html = returnHTML(md);
    expect(html).toBe('<p><a href="https://www.google.com">Google</a></p>');
  });

  // Test image parsing with src and alt attributes
  test("markdown with image", () => {
    const md = "![Placeholder Image](https://placehold.co/100x50)";
    const html = returnHTML(md);
    expect(html).toBe(
      '<p><img src="https://placehold.co/100x50" alt="Placeholder Image" /></p>'
    );
  });
});
