import returnHTML, { insertIntoElement } from "../src/cattownMain.js";
import config from './../src/cattownConfig.json';
const body = document.querySelector("body");

let MarkdownString = `
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

---

This is a normal paragraph with **bold**, *italic*, ***bold italic***, and ~strikethrough~ text.

This paragraph also includes a link to [Google](https://google.com) and an inline image: ![alt text](https://placehold.co/400)

> This is a blockquote.
> It can span multiple lines.
> **bold**, *italic*, ***bold italic***, and ~strikethrough~ text in the blockquote.
> > It also can have other blockquote inside it.

- Unordered list item 1
- Unordered list item 2
- Unordered list item 3 with *italic* and **bold** text

* Another unordered list item using asterisk
* Another item with ~~double tilde strikethrough~~

1. This is ordered list
2. Other item in it
2. Item with same number as last one in markdown, but its corrected here!
55. Item with way to big gap in numbering, also corrected.

Mixed ~single tilde~ and ~~double tilde~~ strikethrough in the same line.

This is inline \`code\` block

---

Paragraph below without formatting.

`;

// Example use just for returning HTML
// let result = returnHTML(MarkdownString);

insertIntoElement(MarkdownString,body)
