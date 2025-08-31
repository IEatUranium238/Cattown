// Main entry point for Cattown markdown parser
import './markdownStyles.css';

export { 
  returnHTML, 
  insertIntoElement, 
  replaceIntoElement, 
  appendIntoElement,
  setDOMPurify
} from './cattownMain.js';

// Re-export configuration for easy access
export { default as getSettings } from './cattownConfig.js';

// Version info
export const version = '1.0.0';
export const name = 'cattown';

// Default export for convenience
export { returnHTML as default } from './cattownMain.js';
