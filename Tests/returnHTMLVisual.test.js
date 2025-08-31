import returnHTML from "../src/cattownMain";

jest.mock('../src/cattownConfig.json', () => ({
  debugMode: false,
  enableSanitization: false,
}));

describe('returnHTML visual tests (markdown to HTML output)', () => {
  test('simple paragraph', () => {
    const md = 'Hi';
    const html = returnHTML(md);
    expect(html).toBe('<p>Hi</p>');
  });

  test('empty markdown input results in empty string', () => {
    const md = '';
    const html = returnHTML(md);
    expect(html).toBe('');
  });

  test('markdown with basic formatting', () => {
    const md = '**bold** *italic* __bold__ _italic_';
    const html = returnHTML(md);
    expect(html).toBe('<p><strong>bold</strong> <em>italic</em> <strong>bold</strong> <em>italic</em></p>');
  });
});
