import returnHTML, { insertIntoElement } from "../src/cattownMain.js";
import config from './../src/cattownConfig.json';
const body = document.querySelector("body");

const field = document.getElementById("input")
const btn = document.getElementById("add")

let MarkdownString = `
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

---

This is a normal paragraph with **bold**, *italic*, ***bold italic***, and ~strikethrough~ text.
**Bold _and italic_ text**.

This paragraph also includes a link to [Google](https://google.com) and an inline image: ![alt text](https://placehold.co/400)

*italic link:* *[google](google.com)*
**bold link:** **[google](google.com)**
***bold italic link:*** ***[google](google.com)***

same but mixed with _

_[google](google.com)_
__[google](google.com)__
___[google](google.com)___

Mix of * and _ for italic bold

*__[google](google.com)__*
__*[google](google.com)*__
**_[google](google.com)_**
_**[google](google.com)**_

Normal link: [google](https://google.com)

> This is a blockquote.
> It can span multiple lines.
> **bold**, *italic*, ***bold italic***, and ~strikethrough~ text in the blockquote.
> > It also can have other blockquote inside it.
> > > And it also can be multiline.

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

// Example use for inserting something into element, replaces all content with it.
// insertIntoElement(MarkdownString,body)


btn.addEventListener("click", () => {
  insertIntoElement(field.value,body)
})