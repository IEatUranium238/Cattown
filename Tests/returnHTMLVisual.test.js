import returnHTML from "../src/cattownMain";

jest.mock("../src/cattownConfig.json", () => ({
  debugMode: false,
  enableSanitization: false,
}));

describe("returnHTML visual tests (markdown to HTML output)", () => {
  test("simple paragraph", () => {
    const md = "Hi";
    const html = returnHTML(md);
    expect(html).toBe("<p>Hi</p>");
  });

  test("empty markdown input results in empty string", () => {
    const md = "";
    const html = returnHTML(md);
    expect(html).toBe("");
  });

  test("markdown with basic formatting", () => {
    const md = "**bold** *italic* __bold__ _italic_";
    const html = returnHTML(md);
    expect(html).toBe(
      "<p><strong>bold</strong> <em>italic</em> <strong>bold</strong> <em>italic</em></p>"
    );
  });

  test("markdown with mixed basic formatting", () => {
    const md =
      "**Bold _and italic_ text** *italic __and bold__ text* __Bold *and italic* text__ _italic **and bold** text_";
    const html = returnHTML(md);
    expect(html).toBe(
      "<p><strong>Bold <em>and italic</em> text</strong> <em>italic <strong>and bold</strong> text</em> <strong>Bold <em>and italic</em> text</strong> <em>italic <strong>and bold</strong> text</em></p>"
    );
  });

  test("markdown with inline link to google", () => {
    const md = "[Google](https://www.google.com)";
    const html = returnHTML(md);
    expect(html).toBe('<p><a href="https://www.google.com">Google</a></p>');
  });

  test("markdown with image", () => {
    const md = "![Placeholder Image](https://placehold.co/100x50)";
    const html = returnHTML(md);
    expect(html).toBe(
      '<p><img src="https://placehold.co/100x50" alt="Placeholder Image" /></p>'
    );
  });
});
