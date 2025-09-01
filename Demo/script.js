import { setSettings } from "cattown";
import returnHTML, { appendIntoElement, insertIntoElement, replaceIntoElement } from "cattown";
import { setDOMPurify } from "cattown";
import DOMpurify from 'dompurify';
setDOMPurify(DOMpurify)

const content = document.getElementById("result");
const field = document.getElementById("input")

// Example use just for returning HTML
// let result = returnHTML(MarkdownString);

// Example use for inserting something into element, replaces all content with it.
// insertIntoElement(MarkdownString,body)


field.addEventListener("input", () => {
  insertIntoElement(field.value,content)
})