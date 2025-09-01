import { setSettings } from "../src/cattownConfig.js";
import returnHTML, { appendIntoElement, insertIntoElement, replaceIntoElement } from "../src/cattownMain.js";
import { setDOMPurify } from "../src/cattownMain.js";
import DOMpurify from 'dompurify';
setDOMPurify("BABA")

setSettings("debugMode", true);

const content = document.getElementById("result");
const field = document.getElementById("input")

// Example use just for returning HTML
// let result = returnHTML(MarkdownString);

// Example use for inserting something into element, replaces all content with it.
// insertIntoElement(MarkdownString,body)


field.addEventListener("input", () => {
  insertIntoElement(field.value,content)
})