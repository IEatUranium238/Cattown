# Cattown

A lightweight, pure JavaScript markdown parser with built-in HTML sanitization using DOMPurify. Cattown converts markdown text to clean, safe HTML with customizable styling and comprehensive markdown support.

## Features 

- **Pure JavaScript**: No external dependencies except DOMPurify for security
- **HTML Sanitization**: Built-in XSS protection with configurable sanitization
- **Comprehensive Markdown Support**: 
  - **Block Elements**: Headers (H1-H6), paragraphs, code blocks, lists (ordered/unordered), blockquotes, horizontal rules, tables, task lists
  - **Inline Elements**: Bold, italic, bold+italic, strikethrough, highlight, subscript, superscript
  - **Links & Images**: Full URL support with automatic HTTPS prefixing
  - **Code**: Inline code and syntax-highlighted code blocks with language detection
  - **Advanced**: Task lists, tables with responsive design, nested lists
- **Customizable Styling**: Built-in CSS classes with CSS variables for easy theming
- **Dark Mode Support**: Built-in dark mode with `.ct-darkmode` class
- **Debug Mode**: Comprehensive logging for development and troubleshooting
- **Performance Optimized**: Efficient tokenization and rendering
- **ES6 Modules**: Modern JavaScript with full module support
- **TypeScript Support**: Full type definitions included
- **Multiple Output Methods**: String output, DOM insertion, replacement, and appending

## Installation 

```bash
npm install cattown
```

Or clone the repository:

```bash
git clone https://github.com/ieaturanium238/cattown.git
cd cattown
npm install
```

## Quick Start 

### Basic Usage

```javascript
import { returnHTML } from 'cattown';

const markdown = "**Hello** *World*!";
const html = returnHTML(markdown);
// Output: "<p><strong>Hello</strong> <em>World</em>!</p>"
```

### Insert into DOM Element

```javascript
import { insertIntoElement } from 'cattown';

const markdown = "# Welcome\nThis is **bold** text.";
const element = document.getElementById('content');
insertIntoElement(markdown, element);
```

### Replace Element Content

```javascript
import { replaceIntoElement } from 'cattown';

const markdown = "## New Content\nUpdated content here.";
const element = document.getElementById('content');
replaceIntoElement(markdown, element);
```

### Append to Element

```javascript
import { appendIntoElement } from 'cattown';

const markdown = "\n\n## Additional Content\nMore content here.";
const element = document.getElementById('content');
appendIntoElement(markdown, element);
```

## Configuration 

Cattown provides several configurable options:

```javascript
import { setSettings, getSettings } from 'cattown';

// Enable debug mode
setSettings("debugMode", true);

// Disable HTML sanitization (not recommended for production)
setSettings("enableSanitization", false);

// Disable custom theme classes
setSettings("useCustomTheme", false);

// Hide language names in code blocks
setSettings("LanguageNameInCode", false);

// Hide icons in code blocks
setSettings("IconInCode", false);
```

### Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `debugMode` | `false` | Enables detailed console logging |
| `enableSanitization` | `true` | Enables HTML sanitization for security |
| `useCustomTheme` | `true` | Applies custom CSS classes for styling |
| `LanguageNameInCode` | `true` | Shows language name in code blocks |
| `IconInCode` | `true` | Shows icons in code blocks |

## CSS Customization 

Cattown includes a set of default styles that you can import and use, but you're also free to create your own custom styling using vanilla CSS or Sass. All Cattown rendered elements have .ct-parsed + element specific class applied when the custom theme option is enabled, making it easy to target and style specific elements.

### Using Cattown's Default Styles

Cattown comes with pre-built styles that you can import:

```javascript
// Import with styles (default)
import { returnHTML } from 'cattown';

// Import styles separately for more control
import 'cattown/styles';
import { returnHTML } from 'cattown';
```

### Creating Your Own Styles

You can create completely custom styles using vanilla CSS or Sass. Cattown renders all elements with specific CSS classes when `useCustomTheme` is enabled, allowing you to target any element for styling.

**Note:** For a complete list of available CSS classes and styling elements, see the [Cattown Documentation](https://example.com) (currently placeholder link).

## Markdown Syntax Support 

### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
==Highlighted text==
~Subscript~
^Superscript^
```

### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](image.jpg)
```

### Code
```markdown
`inline code`

```javascript
// Code block with language
function hello() {
  console.log("Hello, World!");
}
```
```

### Lists
```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Second item

- [ ] Unchecked task
- [x] Checked task
```

### Blockquotes
```markdown
> This is a blockquote
> With multiple lines
```

### Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Horizontal Rules
```markdown
---
```

## API Reference 

### Core Functions

#### `returnHTML(markdown)`
Converts markdown string to sanitized HTML string.

**Parameters:**
- `markdown` (string): The markdown text to convert

**Returns:** (string) Sanitized HTML string

#### `insertIntoElement(markdown, element)`
Converts markdown and inserts the resulting HTML into a DOM element, replacing all content.

**Parameters:**
- `markdown` (string): The markdown text to convert
- `element` (HTMLElement): DOM element to insert HTML into

#### `replaceIntoElement(markdown, element)`
Converts markdown and replaces the element's content with the resulting HTML, with smart diffing.

**Parameters:**
- `markdown` (string): The markdown text to convert
- `element` (HTMLElement): DOM element to replace content in

#### `appendIntoElement(markdown, element)`
Converts markdown and appends the resulting HTML to the end of a DOM element.

**Parameters:**
- `markdown` (string): The markdown text to convert
- `element` (HTMLElement): DOM element to append HTML to

### Configuration Functions

#### `setSettings(setting, value)`
Updates a configuration setting.

**Parameters:**
- `setting` (string): The name of the setting to update
- `value` (*): The new value for the setting

#### `getSettings(setting)`
Retrieves the value of a configuration setting.

**Parameters:**
- `setting` (string): The name of the setting to retrieve

**Returns:** (*) The value of the setting

### Security Functions

#### `setDOMPurify(instance)`
Sets the DOMPurify instance for HTML sanitization.

**Parameters:**
- `instance` (Object): DOMPurify instance

## Development 

### Building
```bash
npm run build
```

### Development Server
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Project Structure
```
src/
├── cattownMain.js      # Main API functions
├── tokenizer.js        # Markdown tokenizer
├── tokensToHTML.js     # Token to HTML converter
├── cattownConfig.js    # Configuration management
└── markdownStyles.css  # Default styling with CSS variables

dist/                   # Built files
├── index.js           # ES6 module
├── index.cjs          # CommonJS module
├── index.d.ts         # TypeScript definitions
└── markdownStyles.css # CSS file
```

## Browser Support 

- Modern browsers with ES6 module support
- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

## Security 

Cattown includes built-in XSS protection through DOMPurify. HTML sanitization is enabled by default and can be configured through the `enableSanitization` setting. It's recommended to keep this enabled in production environments.

**Important:** You must provide a DOMPurify instance for sanitization to work:

```javascript
import DOMPurify from 'dompurify';
import { setDOMPurify } from 'cattown';

setDOMPurify(DOMPurify);
```

## Performance 

- **Efficient Tokenization**: Optimized markdown parsing
- **Smart DOM Updates**: Only updates changed content when using `replaceIntoElement`
- **Minimal Bundle Size**: Lightweight core with optional features
- **Memory Efficient**: No memory leaks from DOM manipulation

## Contributing 

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
