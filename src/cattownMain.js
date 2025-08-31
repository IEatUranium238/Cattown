import tokenizer from "./tokenizer.js";
import convertTokensToHTML from "./tokensToHTML.js";
import DOMPurify from "dompurify";
import config from "./cattownConfig.json";

const isInDebug = config.debugMode;
const useSanitization = config.enableSanitization;

/**
 * Logs debug messages if debug mode is enabled.
 * @param  {...any} args - Arguments to log.
 */
function debugLog(...args) {
  if (!isInDebug) return;
  console.log(...args);
}

/**
 * Converts markdown string to sanitized (optionally) HTML string.
 * @param {string} markdown - The markdown text to convert.
 * @returns {string} - Returns sanitized or raw HTML, or empty string if error occurs.
 */
export function returnHTML(markdown) {
  try {
    let startTime = Date.now();
    debugLog("Cattown - start of returnHTML function.");
    debugLog("Cattown - got markdown: \n", markdown);

    // Tokenize markdown input
    const tokens = tokenizer(markdown);
    debugLog("Cattown - tokenizer token output: \n", tokens);

    // Convert tokens to HTML string
    const dirtyHTML = convertTokensToHTML(tokens);
    debugLog("Cattown - generated HTML code: \n", dirtyHTML);

    // Sanitize HTML if enabled in config
    if (useSanitization) {
      const cleanHTML = DOMPurify.sanitize(dirtyHTML);
      debugLog("Cattown - sanitized HTML code: \n", cleanHTML);
      let endTime = Date.now();
      let elapsedTime = endTime - startTime;
      debugLog("Cattown - done! Time took: " + elapsedTime + "ms");
      return cleanHTML;
    } else {
      let endTime = Date.now();
      let elapsedTime = endTime - startTime;
      debugLog("Cattown - done! Time took: " + elapsedTime + "ms");
      return dirtyHTML;
    }
  } catch (error) {
    console.error("Cattown - failed to render markdown! Error: \n", error);
    return ""; // return nothing if error
  }
}

/**
 * Converts markdown and inserts resulting HTML into a DOM element.
 * Replaces all content with result.
 * @param {string} markdown - The markdown text to convert.
 * @param {HTMLElement} element - DOM element to insert HTML into.
 */
export function insertIntoElement(markdown, element) {
  try {
    let startTime = Date.now();
    debugLog("Cattown - start of insertIntoElement function.");
    debugLog("Cattown - got markdown: \n", markdown);

    // Tokenize markdown input
    const tokens = tokenizer(markdown);
    debugLog("Cattown - tokenizer token output: \n", tokens);

    // Convert tokens to HTML string
    const dirtyHTML = convertTokensToHTML(tokens);
    debugLog("Cattown - generated HTML code: \n", dirtyHTML);

    // Sanitize HTML if enabled and insert into the element
    if (useSanitization) {
      const cleanHTML = DOMPurify.sanitize(dirtyHTML);
      debugLog("Cattown - sanitized HTML code: \n", cleanHTML);
      element.innerHTML = cleanHTML;
    } else {
      element.innerHTML = dirtyHTML;
    }

    let endTime = Date.now();
    let elapsedTime = endTime - startTime;
    debugLog("Cattown - done! Time took: " + elapsedTime + "ms");
  } catch (error) {
    console.error("Cattown - failed to render markdown! Error: \n", error);
  }
}

export default returnHTML;
