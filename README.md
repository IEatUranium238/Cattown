# Cattown

A light, pure JavaScript markdown parser that transforms your markdown into clean, safe HTML with HTML sanitization powered by DOMPurify. Cattown is your purr-fect for quick, customizable markdown rendering.

## Features

### Core Functionality
- **Pure JavaScript**: Just Cattown and its trusty sidekick DOMPurify—no bulky dependencies here.
- **HTML Sanitization**: Built-in XSS protection with configurable settings to keep your content safe.
- **Performance Optimized**: Fast iterative tokenization and intelligent DOM diffing to update only what needs updating.
- **Versatile Output Methods**: 
  - `returnHTML()` – spits out a HTML string.
  - `insertIntoElement()` – puts your rendered markdown right into an element.
  - `replaceIntoElement()` – smart DOM updates that won’t slow you down.
  - `appendIntoElement()` – add more content without touching the old stuff.

### Markdown Support

#### Block Elements
- Headers H1-H6 with proper hierarchy (because size matters).
- Paragraphs automatically wrapped for that neat look.
- Fenced code blocks with language detection and cute syntax highlighting icons.
- Lists galore: unordered, ordered, and task lists with checkboxes.
- Multi-line blockquotes for dramatic effect.
- Tables that stick around nicely on any device.
- Horizontal rules for when you really need to separate things.

#### Inline Elements
- Text formatting: bold, italic, bold+italic, strikethrough, highlight, subscript, superscript.
- Smart links with auto HTTPS prefixing (because we don’t trust unsecured websites).
- Responsive images that look good on all screens.
- Inline code with pretty syntax highlighting.

### Customization & Theming
- Dark Mode support in included css with `.ct-darkmode`, because your eyes deserve a break.
- Custom styling hooks with `.ct-parsed` classes.
- Configurable options to turn on debug logs, toggle sanitization, and control language names/icons in code blocks.

### Modern Development
- Fully ES6 modules with CommonJS compatibility.
- TypeScript support for those who like their code typed and neat.
- Rock-solid support for modern browsers (sorry Internet Explorer, maybe next lifetime).

## Installation

Using npm:

```bash
npm install cattown
```

Or clone and get going:

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
// Result: "<p><strong>Hello</strong> <em>World</em>!</p>"
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

const markdown = "\n\n## More Content\nExtra goodies here.";
const element = document.getElementById('content');
appendIntoElement(markdown, element);
```

## Configuration

Change Cattown’s settings with these options:

```javascript
import { setSettings } from 'cattown';

// Enable debug logs
setSettings("debugMode", true);

// Turn off HTML sanitization
setSettings("enableSanitization", false);

// Disable custom styling classes
setSettings("useCustomTheme", false);

// Hide language names in code blocks
setSettings("LanguageNameInCode", false);

// Hide icons in code blocks
setSettings("IconInCode", false);
```

### Available Settings

| Setting              | Default | Description                           |
|----------------------|---------|-------------------------------------|
| `debugMode`          | false   | Logs details for developers           |
| `enableSanitization` | true    | Keeps HTML safe from sketchy scripts |
| `useCustomTheme`     | true    | Applies Cattown’s class for styling        |
| `LanguageNameInCode` | true    | Shows language tags in code blocks    |
| `IconInCode`         | true    | Shows those cute language icons       |

## CSS Customization

Feel free to unleash your inner artist—style away with vanilla CSS, Sass or any other way you like. With `.ct-parsed` and element-specific classes.
To see all element-specific classes please see our [documentation](example.com).

### Using Default Styles

```javascript
import 'cattown/styles';  // Import included styles
import { returnHTML } from 'cattown';
```

## API Reference

### Core Functions

- `returnHTML(markdown)`: Returns sanitized HTML string from markdown.
- `insertIntoElement(markdown, element)`: Inserts HTML into a DOM element.
- `replaceIntoElement(markdown, element)`: Replaces element content with smart diffing.
- `appendIntoElement(markdown, element)`: Appends HTML to element.

### Configuration Functions

- `setSettings(setting, value)`: Change a config option.
- `getSettings(setting)`: Retrieve config value.

### Security Functions

- `setDOMPurify(instance)`: Provide a DOMPurify instance for sanitization.

## Development

- Build: `npm run build`
- Dev server: `npm run dev`
- Test: `npm test`

## Browser Support

- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+
- Not Internet Exploder (seriously, why?)

## Security

XSS protection provided by DOMPurify by default (keep it on unless you want trouble). Don’t forget to set your DOMPurify instance:

```javascript
import DOMPurify from 'dompurify';
import { setDOMPurify } from 'cattown';

setDOMPurify(DOMPurify);
```

## Performance

- Fast tokenization.
- Smart DOM updates to keep your app nimble.
- Minimal footprint.
- No memory leaks.

## Contributing

Contributions welcome! Follow the usual dance:

1. Fork it.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a PR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
