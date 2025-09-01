/**
 * CATTOWN MAIN MODULE
 *
 * This module contains the core functionality for converting markdown to HTML.
 * It provides four main functions for different use cases:
 *
 * 1. returnHTML() - Convert to HTML string
 * 2. insertIntoElement() - Replace element content
 * 3. appendIntoElement() - Append to element content
 * 4. replaceIntoElement() - Smart DOM diffing for efficient updates
 *
 * The module handles:
 * - Markdown tokenization and parsing
 * - HTML generation from tokens
 * - Optional HTML sanitization via DOMPurify
 * - Performance timing and debug logging
 * - Error handling and graceful degradation
 */

import tokenizer from "./tokenizer.js";
import convertTokensToHTML from "./tokensToHTML.js";
import getSettings from "./cattownConfig.js";

/**
 * DOMPurify instance for HTML sanitization.
 * Must be set by the user via setDOMPurify() function before using sanitization.
 * This allows users to provide their own DOMPurify instance or version.
 */
let DOMPurify = null;

/**
 * Sets the DOMPurify instance for HTML sanitization.
 *
 * This function must be called with a valid DOMPurify instance before using
 * any conversion functions with sanitization enabled. The instance is used
 * to clean HTML output and prevent XSS attacks.
 *
 * @param {Object} instance - A DOMPurify instance with sanitize method
 *
 * @example
 * import DOMPurify from 'dompurify';
 * import { setDOMPurify } from 'cattown';
 *
 * // Set DOMPurify instance for sanitization
 * setDOMPurify(DOMPurify);
 */
export function setDOMPurify(instance) {
  try {
    if (typeof(instance) !== "function"){
      throw new Error("Type of instance is not function, got "+typeof(instance))
    }
    DOMPurify = instance;
  } catch (e) {
    console.error(`Cattown - Failed to set DOMPurify instance! Got error:`);
    console.error(e);
  }
  
}

// Checks if DOMPurify if set up, if no then throws an warning.
if (DOMPurify == false) {
  console.warn(`Cattown - no DOMPurify instance set up, sanitization will not work!
Use setDOMPurify() inside your code to set up DOMPurify instance.
Example:
import { setDOMPurify } from 'cattown';
import DOMpurify from 'dompurify';
setDOMPurify(DOMpurify)`);
}

/**
 * Cached debug mode status for performance.
 * Updated by checkDebug() before each conversion operation.
 */
let isInDebug = getSettings("debugMode");

/**
 * Updates the cached debug mode status from current configuration.
 *
 * This function is called at the start of each conversion operation to ensure
 * debug logging reflects the current configuration state. Using a cached value
 * improves performance by avoiding repeated configuration lookups.
 */
function checkDebug() {
  isInDebug = getSettings("debugMode");
}

/**
 * Outputs debug messages to console when debug mode is enabled.
 *
 * This function provides conditional logging that only outputs messages
 * when debug mode is active. It helps track the conversion process,
 * performance timing, and troubleshoot parsing issues.
 *
 * @param  {...any} args - Any number of arguments to log to console
 *
 * @example
 * debugLog("Starting tokenization for:", markdown);
 * debugLog("Generated tokens:", tokens);
 * debugLog("Conversion completed in", elapsedTime, "ms");
 */
function debugLog(...args) {
  if (!isInDebug) return;
  console.log(...args);
}

/**
 * Converts markdown text to HTML string with optional sanitization.
 *
 * This is the core conversion function that transforms markdown syntax into
 * clean HTML. It performs the complete conversion pipeline: tokenization,
 * HTML generation, and optional sanitization for security.
 *
 * Process:
 * 1. Parse markdown into structured tokens
 * 2. Convert tokens to HTML string
 * 3. Optionally sanitize HTML with DOMPurify
 * 4. Return final HTML string
 *
 * @param {string} markdown - The markdown text to convert. Supports all
 *   standard markdown syntax including headers, lists, links, images,
 *   code blocks, tables, and inline formatting.
 *
 * @returns {string} The converted HTML string. Returns:
 *   - Sanitized HTML if enableSanitization=true and DOMPurify is available
 *   - Unsanitized HTML if enableSanitization=false or DOMPurify not set
 *   - Empty string if an error occurs during conversion
 *
 * @example
 * // Basic conversion
 * const html = returnHTML("**Bold** and *italic* text");
 * // Returns: "<p><strong>Bold</strong> and <em>italic</em> text</p>"
 *
 * // With code block
 * const html = returnHTML("```javascript\nconsole.log('Hello');\n```");
 * // Returns: Language-labeled code block with syntax highlighting classes
 *
 * // Complex markdown
 * const markdown = `
 * # Heading
 * - List item
 * [Link](https://example.com)
 * `;
 * const html = returnHTML(markdown);
 */
export function returnHTML(markdown) {
  try {
    // Update debug status and start performance timing
    checkDebug();
    const useSanitization = getSettings("enableSanitization");
    let startTime = Date.now();
    debugLog("Cattown - start of returnHTML function.");
    debugLog("Cattown - got markdown: \n", markdown);

    // Step 1: Parse markdown into structured tokens
    const tokens = tokenizer(markdown);
    debugLog("Cattown - tokenizer token output: \n", tokens);

    // Step 2: Convert tokens to HTML string
    const dirtyHTML = convertTokensToHTML(tokens);
    debugLog("Cattown - generated HTML code: \n", dirtyHTML);

    // Step 3: Sanitize HTML if enabled and DOMPurify is available
    if (useSanitization && DOMPurify) {
      const cleanHTML = DOMPurify.sanitize(dirtyHTML);
      debugLog("Cattown - sanitized HTML code: \n", cleanHTML);
      let endTime = Date.now();
      let elapsedTime = endTime - startTime;
      debugLog("Cattown - done! Time took: " + elapsedTime + "ms");
      return cleanHTML;
    } else {
      // Log warning if sanitization was requested but DOMPurify not available
      if (useSanitization && !DOMPurify) {
        debugLog(
          "Cattown - sanitization requested but DOMPurify not available, returning unsanitized HTML"
        );
      }
      let endTime = Date.now();
      let elapsedTime = endTime - startTime;
      debugLog("Cattown - done! Time took: " + elapsedTime + "ms");
      return dirtyHTML;
    }
  } catch (error) {
    console.error("Cattown - failed to render markdown! Error: \n", error);
    return ""; // Return empty string for graceful error handling
  }
}

/**
 * Converts markdown and replaces the entire content of a DOM element.
 *
 * This function performs the same conversion as returnHTML() but directly
 * inserts the result into a DOM element, completely replacing its existing
 * content. This is useful for updating entire content areas or initializing
 * elements with markdown content.
 *
 * @param {string} markdown - The markdown text to convert and insert
 * @param {HTMLElement} element - DOM element to replace content in.
 *   Must be a valid HTML element with innerHTML property.
 *
 * @example
 * // Replace entire content of an element
 * const contentDiv = document.getElementById('content');
 * insertIntoElement("# New Content\nThis replaces everything.", contentDiv);
 *
 * // Update a specific section
 * const section = document.querySelector('.markdown-section');
 * insertIntoElement(markdownFromAPI, section);
 */
export function insertIntoElement(markdown, element) {
  try {
    // Update debug status and start performance timing
    checkDebug();
    const useSanitization = getSettings("enableSanitization");
    let startTime = Date.now();
    debugLog("Cattown - start of insertIntoElement function.");
    debugLog("Cattown - got markdown: \n", markdown);

    // Step 1: Parse markdown into structured tokens
    const tokens = tokenizer(markdown);
    debugLog("Cattown - tokenizer token output: \n", tokens);

    // Step 2: Convert tokens to HTML string
    const dirtyHTML = convertTokensToHTML(tokens);
    debugLog("Cattown - generated HTML code: \n", dirtyHTML);

    // Step 3: Sanitize and insert HTML into the target element
    if (useSanitization && DOMPurify) {
      const cleanHTML = DOMPurify.sanitize(dirtyHTML);
      debugLog("Cattown - sanitized HTML code: \n", cleanHTML);
      element.innerHTML = cleanHTML;
    } else {
      if (useSanitization && !DOMPurify) {
        debugLog(
          "Cattown - sanitization requested but DOMPurify not available, using unsanitized HTML"
        );
      }
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
 * Converts markdown and appends the resulting HTML to the end of a DOM element.
 *
 * This function adds converted markdown content to the existing content of an
 * element rather than replacing it. Useful for building up content incrementally,
 * adding sections, or implementing "load more" functionality.
 *
 * @param {string} markdown - The markdown text to convert and append
 * @param {HTMLElement} element - DOM element to append content to.
 *   Must be a valid HTML element with innerHTML property.
 *
 * @example
 * // Add content to existing element
 * const container = document.getElementById('comments');
 * appendIntoElement("\n\n## New Comment\nThis adds to existing content.", container);
 *
 * // Incrementally build content
 * const article = document.querySelector('.article');
 * appendIntoElement("## Introduction\nFirst section...", article);
 * appendIntoElement("\n\n## Details\nSecond section...", article);
 */
export function appendIntoElement(markdown, element) {
  try {
    // Update debug status and start performance timing
    checkDebug();
    const useSanitization = getSettings("enableSanitization");
    let startTime = Date.now();
    debugLog("Cattown - start of appendIntoElement function.");
    debugLog("Cattown - got markdown: \n", markdown);

    // Step 1: Parse markdown into structured tokens
    const tokens = tokenizer(markdown);
    debugLog("Cattown - tokenizer token output: \n", tokens);

    // Step 2: Convert tokens to HTML string
    const dirtyHTML = convertTokensToHTML(tokens);
    debugLog("Cattown - generated HTML code: \n", dirtyHTML);

    // Step 3: Sanitize and append HTML to the target element
    if (useSanitization && DOMPurify) {
      const cleanHTML = DOMPurify.sanitize(dirtyHTML);
      debugLog("Cattown - sanitized HTML code: \n", cleanHTML);
      element.innerHTML += cleanHTML;
    } else {
      if (useSanitization && !DOMPurify) {
        debugLog(
          "Cattown - sanitization requested but DOMPurify not available, using unsanitized HTML"
        );
      }
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
 * Converts markdown and efficiently updates a DOM element using smart diffing.
 *
 * This is the most sophisticated function in Cattown, implementing a DOM diffing
 * algorithm that only updates changed content. It compares the new HTML structure
 * with existing content and makes minimal changes, preserving unchanged elements
 * and their state (like scroll position, form inputs, etc.).
 *
 * Algorithm:
 * 1. Convert markdown to HTML in a temporary container
 * 2. Compare each new node with corresponding existing node
 * 3. Only replace nodes that have actually changed
 * 4. Add new nodes if needed, remove excess nodes if fewer
 *
 * Benefits:
 * - Preserves DOM state (focus, scroll, form values)
 * - Better performance for large documents with small changes
 * - Smoother user experience during live editing
 * - Minimal DOM reflow and repaint
 *
 * @param {string} markdown - The markdown text to convert and update with
 * @param {HTMLElement} element - DOM element to update efficiently.
 *   Content will be compared and only changed parts updated.
 *
 * @example
 * // Efficient live preview updates
 * const editor = document.getElementById('editor');
 * const preview = document.getElementById('preview');
 * editor.addEventListener('input', () => {
 *   replaceIntoElement(editor.value, preview);
 * });
 *
 * // Update content while preserving user state
 * replaceIntoElement(updatedMarkdown, contentElement);
 * // Scroll position, selected text, etc. preserved where possible
 */
export function replaceIntoElement(markdown, element) {
  try {
    // Initialize debug logging and performance tracking
    checkDebug();
    const useSanitization = getSettings("enableSanitization");
    const startTime = Date.now();

    // Step 1: Convert markdown to HTML tokens and render
    const tokens = tokenizer(markdown);
    let dirtyHTML = convertTokensToHTML(tokens);

    // Step 2: Apply sanitization if configured
    if (useSanitization && DOMPurify) {
      dirtyHTML = DOMPurify.sanitize(dirtyHTML);
    }

    // Step 3: Create temporary DOM container for new content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = dirtyHTML;

    /**
     * Deep comparison function to determine if two DOM nodes are equivalent.
     *
     * This function recursively compares all aspects of DOM nodes:
     * - Node type (element, text, etc.)
     * - Tag name for elements
     * - All attributes and their values
     * - Text content for text nodes
     * - All child nodes recursively
     *
     * @param {Node} n1 - First node to compare
     * @param {Node} n2 - Second node to compare
     * @returns {boolean} True if nodes are structurally identical
     */
    function nodesAreEqual(n1, n2) {
      // Different node types means definitely not equal
      if (n1.nodeType !== n2.nodeType) return false;

      // For text nodes, compare content directly
      if (n1.nodeType === Node.TEXT_NODE) {
        return n1.textContent === n2.textContent;
      }

      // For elements, compare tag names
      if (n1.nodeName !== n2.nodeName) return false;

      // Compare all attributes
      const a1 = n1.attributes,
        a2 = n2.attributes;
      if (a1.length !== a2.length) return false;

      for (let i = 0; i < a1.length; i++) {
        const attrName = a1[i].name;
        if (n2.getAttribute(attrName) !== a1[i].value) {
          return false;
        }
      }

      // Compare child node count
      if (n1.childNodes.length !== n2.childNodes.length) return false;

      // Recursively compare all child nodes
      for (let i = 0; i < n1.childNodes.length; i++) {
        if (!nodesAreEqual(n1.childNodes[i], n2.childNodes[i])) return false;
      }

      return true;
    }

    // Step 4: Get node arrays for comparison
    const existingNodes = Array.from(element.childNodes);
    const newNodes = Array.from(tempDiv.childNodes);

    // Step 5: Remove any extra existing nodes (if new content has fewer elements)
    for (let i = newNodes.length; i < existingNodes.length; i++) {
      element.removeChild(existingNodes[i]);
    }

    // Step 6: Update, replace, or add nodes as needed
    for (let i = 0; i < newNodes.length; i++) {
      const newNode = newNodes[i];
      const existingNode = existingNodes[i];

      if (!existingNode) {
        // No existing node at this position - append the new one
        element.appendChild(newNode);
      } else if (!nodesAreEqual(existingNode, newNode)) {
        // Nodes are different - replace the existing one
        element.replaceChild(newNode, existingNode);
      } else {
        // Nodes are identical - no change needed, just clean up temp container
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
