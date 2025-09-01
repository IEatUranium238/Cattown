/**
 * CATTOWN - A lightweight, pure JavaScript markdown parser with built-in HTML sanitization
 * 
 * This is the main entry point for the Cattown library. It provides a comprehensive
 * set of functions for converting markdown text to clean, safe HTML with customizable
 * styling and multiple output methods.
 * 
 * Features:
 * - Pure JavaScript with only DOMPurify as dependency for security
 * - Built-in XSS protection through HTML sanitization
 * - Multiple output methods (string, DOM insertion, smart updating)
 * - Comprehensive markdown support (headers, lists, tables, code blocks, etc.)
 * - Customizable styling with CSS variables and dark mode support
 * 
 * @author ieaturanium238
 * @version 1.0.0
 * @license MIT
 */

// Import default styles - users can override or disable via configuration
import './markdownStyles.css';

// Export core markdown conversion functions
export { 
  returnHTML,           // Convert markdown to HTML string
  insertIntoElement,    // Replace element content with rendered markdown
  replaceIntoElement,   // Smart DOM diffing for efficient updates
  appendIntoElement,    // Append rendered markdown to element
  setDOMPurify         // Set DOMPurify instance for sanitization
} from './cattownMain.js';

// Export configuration management functions for customizing behavior
export { 
  default as getSettings,  // Get current configuration values
  setSettings              // Update configuration settings
} from './cattownConfig.js';

// Library metadata for version checking and debugging
export const version = '1.0.0';
export const name = 'cattown';

// Default export for convenience - most common use case
export { returnHTML as default } from './cattownMain.js';
