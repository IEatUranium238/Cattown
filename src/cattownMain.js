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
    debugLog("Cattown - start of returnHTML function.");
    debugLog("Cattown - got markdown:", markdown);

    // Tokenize markdown input
    const tokens = tokenizer(markdown);
    debugLog("Cattown - tokenizer token output:", tokens);

    // Convert tokens to HTML string
    const dirtyHTML = convertTokensToHTML(tokens);
    debugLog("Cattown - generated HTML code:", dirtyHTML);

    // Sanitize HTML if enabled in config
    if (useSanitization) {
      const cleanHTML = DOMPurify.sanitize(dirtyHTML);
      debugLog("Cattown - sanitized HTML code:", cleanHTML);
      debugLog("Cattown - done!");
      return cleanHTML;
    } else {
      debugLog("Cattown - done!");
      return dirtyHTML;
    }

  } catch (error) {
    console.error("Cattown - failed to render markdown! Error:", error);
    return ""; // return nothing if error
  }
}

/**
 * Converts markdown and inserts resulting HTML into a DOM element.
 * @param {string} markdown - The markdown text to convert.
 * @param {HTMLElement} element - DOM element to insert HTML into.
 */
export function insertIntoElement(markdown, element) {
  try {
    debugLog("Cattown - start of insertIntoElement function.");
    debugLog("Cattown - got markdown:", markdown);

    // Tokenize markdown input
    const tokens = tokenizer(markdown);
    debugLog("Cattown - tokenizer token output:", tokens);

    // Convert tokens to HTML string
    const dirtyHTML = convertTokensToHTML(tokens);
    debugLog("Cattown - generated HTML code:", dirtyHTML);

    // Sanitize HTML if enabled and insert into the element
    if (useSanitization) {
      const cleanHTML = DOMPurify.sanitize(dirtyHTML);
      debugLog("Cattown - sanitized HTML code:", cleanHTML);
      element.innerHTML = cleanHTML;
    } else {
      element.innerHTML = dirtyHTML;
    }

    debugLog("Cattown - done!");
  } catch (error) {
    console.error("Cattown - failed to render markdown! Error:", error);
  }
}

export default returnHTML;
