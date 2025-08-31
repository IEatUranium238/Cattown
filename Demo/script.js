import returnHTML, { appendIntoElement, insertIntoElement, replaceIntoElement } from "../src/cattownMain.js";
import config from './../src/cattownConfig.json';
const content = document.getElementById("result");

const field = document.getElementById("input")

// Example use just for returning HTML
// let result = returnHTML(MarkdownString);

// Example use for inserting something into element, replaces all content with it.
// insertIntoElement(MarkdownString,body)


field.addEventListener("input", () => {
  replaceIntoElement(field.value,content)
})