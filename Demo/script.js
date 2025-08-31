import returnHTML, { insertIntoElement } from "../src/cattownMain.js";
import config from './../src/cattownConfig.json';
const body = document.querySelector("body");

const field = document.getElementById("input")
const btn = document.getElementById("add")

// Example use just for returning HTML
// let result = returnHTML(MarkdownString);

// Example use for inserting something into element, replaces all content with it.
// insertIntoElement(MarkdownString,body)


btn.addEventListener("click", () => {
  insertIntoElement(field.value,body)
})