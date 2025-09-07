# Guide for making your own styles  
This guide covers customizing CSS for Cattown.  
Use this as a reference to target and style markdown elements from a custom stylesheet.  
___  
## Core Concept  
- Enable the `useCustomTheme` setting to apply these styles.  
- All parsed markdown elements include the class `.ct-parsed`.  
- Element-specific styles are identified using `.ct-parsed` combined with semantic class names reflecting the markdown element type (e.g., `.ct-parsed.heading-1` for H1).  
- This structure allows you to scope styles specifically to markdown-generated content, avoiding interference with other page styles.  
___  
## Example code  
Basic CSS:  
``` CSS
.ct-parsed.heading {
  color: red; /* Makes all headings red */
}
/* Add more styles below */
```
Sass (.scss):  
``` SCSS
.ct-parsed {
  &.heading {
    color: red; // Makes all headings red
  }
  // Add more styles here for elements
}
```
___  
## Base  
- `.ct-parsed` serves as the base styles for all content.  
- Use it to globally set rules for all markdown content.  
___  
## Headings  
- Headings employ `.heading` or heading level classes `.heading-1` through `.heading-6` for specific heading levels.  
___  
## Paragraphs  
- `.paragraph` defines base paragraph styles.  
- Styling classes include `.bold`, `.italic`, `.strikethrough`, `.highlight`, `.subscript`, and `.superscript`.  
___  
## Links  
- Links get `.link`.  
- Links can also support paragraph modifiers.  
___  
## Images  
- Parsed images are marked `.image`.  
___  
## Inline Code  
- Inline code snippets use `.code`.  
___  
## Blockquotes  
- Blockquotes utilize `.blockquote`.  
___  
## Lists  
- Unordered and ordered lists are `.list` and `.olist` respectively.  
- List items are `.list-item` and `.olist-item` with a bit of bottom margin spacing.  
- Nested lists have the `.nested-list` class.  
- Nested list numbering such as "1.1" requires style, example:  
``` CSS
.ct-parsed.olist {
  counter-reset: item;
  list-style: none;
  padding-left: 1.5em;
}
.ct-parsed.olist > li {
  counter-increment: item;
}
.ct-parsed.olist > li::before {
  content: counters(item, ".") " ";
}
.ct-parsed.nested-list {
  margin: 0;
}
```
___  
## Task Lists  
- Task lists use `.tasklist`.  
- Items are `.tasklist-item` with flex layout for checkbox alignment.  
- Checkbox can be configured using `.ct-parsed.tasklist li.ct-parsed.tasklist-item input[type="checkbox"]`.  
___  
## Horizontal Rules  
- Horizontal lines get `.hr`.  
___  
## Code Blocks  
- Code block components include `.codeblock-lang-label`, `.codeblock-pre`, `.codeblock-code`, and `.codeblock-image`.  
- `.codeblock-pre` is the container that controls background, padding, scrolling, and border radius.  
- `.codeblock-code` is the actual code font and color.  
- `.codeblock-lang-label` is the text and the container for the icon.  
- `.codeblock-image` is the language icon itself, image itself if provided via Devicon.  
- You need to enable the `LanguageNameInCode` setting for the language name to be shown; to see the icon enable the `IconInCode` setting alongside the setting for text.  
___  
## Tables  
- Tables are wrapped in `.table-container` for horizontal scrolling.  
- The table element itself uses `.table` with width, border spacing, and minimum width control.  
- Header rows and cells are `.table thead tr` and `.table-header-cell`.  
- Body rows `.table tbody tr` have borders and alternate row backgrounds by using `.table-row:nth-child(even/odd)`.  
- Data cells are `.table-cell`.  
