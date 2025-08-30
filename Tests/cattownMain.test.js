import { jest } from '@jest/globals';
import * as cattownMain from '../src/cattownMain.js';

jest.mock('../src/tokenizer.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../src/tokensToHTML.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('dompurify', () => ({
  sanitize: jest.fn((input) => input),
}));

jest.mock('../src/cattownConfig.json', () => ({
  debugMode: false,
  enableSanitization: true,
}), { virtual: true });

describe('returnHTML', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns sanitized HTML string from markdown', () => {
    require('../src/tokenizer.js').default.mockReturnValue(['token']);
    require('../src/tokensToHTML.js').default.mockReturnValue('<p>Hi</p>');

    const html = cattownMain.returnHTML('Hi');
    expect(html).toBe('<p>Hi</p>');
  });

  test('returns raw HTML string when sanitization disabled in config', () => {
    jest.mock('../src/cattownConfig.json', () => ({
      debugMode: false,
      enableSanitization: false,
    }), { virtual: true });

    require('../src/tokenizer.js').default.mockReturnValue(['token']);
    require('../src/tokensToHTML.js').default.mockReturnValue('<p>Raw HTML</p>');

    const html = cattownMain.returnHTML('Hello');
    expect(html).toBe('<p>Raw HTML</p>');
  });

  test('handles empty markdown input gracefully', () => {
    require('../src/tokenizer.js').default.mockReturnValue([]);
    require('../src/tokensToHTML.js').default.mockReturnValue('');

    const html = cattownMain.returnHTML('');
    expect(html).toBe('');
  });

  test('returns undefined on error in tokenizing', () => {
    require('../src/tokenizer.js').default.mockImplementation(() => {
      throw new Error('Tokenize failure');
    });

    const html = cattownMain.returnHTML('some input');
    expect(html).toBeUndefined();
  });
});
