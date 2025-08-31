import tokenizer from "./tokenizer.js";
import convertTokensToHTML from "./tokensToHTML.js";
import DOMPurify from "dompurify";
import getSettings from "./cattownConfig.js";
let isInDebug = getSettings("debugMode");

/**
 * Updates debug value.
 */
function checkDebug(){
  isInDebug = getSettings("debugMode");
}

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
    checkDebug()
    const useSanitization = getSettings("enableSanitization");
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
    checkDebug()
    const useSanitization = getSettings("enableSanitization");
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

/**
 * Converts markdown and appends resulting HTML into a DOM element.
 * @param {string} markdown - The markdown text to convert.
 * @param {HTMLElement} element - DOM element to append HTML into.
 */
export function appendIntoElement(markdown, element) {
  try {
    checkDebug()
    const useSanitization = getSettings("enableSanitization");
    let startTime = Date.now();
    debugLog("Cattown - start of appendIntoElement function.");
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
      element.innerHTML += cleanHTML;
    } else {
      element.innerHTML += dirtyHTML;
    }

    let endTime = Date.now();
    let elapsedTime = endTime - startTime;
    debugLog("Cattown - done! Time took: " + elapsedTime + "ms");
  } catch (error) {
    console.error("Cattown - failed to render markdown! Error: \n", error);
  }
}

/**
 * Converts markdown and updates only changed parts in a DOM element.
 * Keeps duplicates and only replaces/adds needed parts.
 * @param {string} markdown - The markdown text to convert.
 * @param {HTMLElement} element - DOM element to update HTML into.
 */
export function replaceIntoElement(markdown, element) {
  try {
    checkDebug()
    const useSanitization = getSettings("enableSanitization");
    const startTime = Date.now();

    // Tokenize and render markdown
    const tokens = tokenizer(markdown);
    let dirtyHTML = convertTokensToHTML(tokens);

    // Sanitize if needed
    if (useSanitization && typeof DOMPurify !== "undefined") {
      dirtyHTML = DOMPurify.sanitize(dirtyHTML);
    }

    // Create temporary container only once per call
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = dirtyHTML;

    // Node comparison
    function nodesAreEqual(n1, n2) {
      if (n1.nodeType !== n2.nodeType) return false;

      if (n1.nodeType === Node.TEXT_NODE) {
        return n1.textContent === n2.textContent;
      }

      if (n1.nodeName !== n2.nodeName) return false;

      const a1 = n1.attributes,
        a2 = n2.attributes;
      if (a1.length !== a2.length) return false;

      for (let i = 0; i < a1.length; i++) {
        const attrName = a1[i].name;
        if (n2.getAttribute(attrName) !== a1[i].value) {
          return false;
        }
      }

      if (n1.childNodes.length !== n2.childNodes.length) return false;

      for (let i = 0; i < n1.childNodes.length; i++) {
        if (!nodesAreEqual(n1.childNodes[i], n2.childNodes[i])) return false;
      }

      return true;
    }

    const existingNodes = Array.from(element.childNodes);
    const newNodes = Array.from(tempDiv.childNodes);

    // Remove extra existing nodes in one loop at end
    for (let i = newNodes.length; i < existingNodes.length; i++) {
      element.removeChild(existingNodes[i]);
    }

    // Update or append nodes; adopt nodes instead of cloning
    for (let i = 0; i < newNodes.length; i++) {
      const newNode = newNodes[i];
      const existingNode = existingNodes[i];

      if (!existingNode) {
        // Move new node directly from tempDiv
        element.appendChild(newNode);
      } else if (!nodesAreEqual(existingNode, newNode)) {
        element.replaceChild(newNode, existingNode);
      } else {
        // If equal, remove from tempDiv to prevent duplicate appending
        tempDiv.removeChild(newNode);
      }
    }

    const endTime = Date.now();
    debugLog(`Cattown - done! Time took: ${endTime - startTime}ms`);
  } catch (error) {
    console.error("Cattown - failed to render markdown! Error: \n", error);
  }
}

export default returnHTML;
