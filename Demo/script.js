import { setSettings } from "../src/cattownConfig";
import returnHTML, { appendIntoElement, insertIntoElement, replaceIntoElement } from "../src/cattownMain";
import { setDOMPurify } from "../src/cattownMain";
import DOMpurify from 'dompurify';
setDOMPurify(DOMpurify)
setSettings('debugMode',true)

const content = document.getElementById("result");
const field = document.getElementById("input")

// Example use just for returning HTML
// let result = returnHTML(MarkdownString);

// Example use for inserting something into element, replaces all content with it.
// insertIntoElement(MarkdownString,body)

// Example use for appending something into element, adds content into it.
// appendIntoElement(MarkdownString,body)


field.addEventListener("input", () => {
  insertIntoElement(field.value,content)
})