/**
 * CATTOWN CONFIGURATION MODULE
 * 
 * This module manages all configuration settings for the Cattown markdown parser.
 * It provides a centralized way to control behavior, styling, and features.
 * 
 * Configuration options control:
 * - Theme and styling behavior
 * - Debug output and logging
 * - Security features
 * - Code block presentation
 * 
 * All settings can be modified at runtime using setSettings() function.
 */

/**
 * Main configuration object containing all customizable settings.
 * These settings affect how markdown is parsed and rendered.
 */
let config = {
  /**
   * useCustomTheme (boolean): Controls whether custom CSS classes are applied to rendered elements.
   * - true: Adds 'ct-parsed' and element-specific classes for custom styling
   * - false: Renders plain HTML without additional CSS classes
   * Default: true
   */
  useCustomTheme: true,

  /**
   * debugMode (boolean): Enables detailed console logging for development and troubleshooting.
   * - true: Logs tokenization steps, timing information, and processing details
   * - false: Silent operation with only error messages
   * Default: false
   */
  debugMode: false,

  /**
   * enableSanitization (boolean): Controls HTML sanitization for security.
   * - true: Uses DOMPurify to sanitize output HTML (recommended for production)
   * - false: Returns raw HTML without sanitization (use with caution)
   * Note: Requires DOMPurify instance to be set via setDOMPurify()
   * Default: true
   */
  enableSanitization: true,

  /**
   * LanguageNameInCode (boolean): Shows programming language name in code blocks.
   * - true: Displays language name label above fenced code blocks (```javascript)
   * - false: Hides language name labels
   * Default: true
   */
  LanguageNameInCode: true,

  /**
   * IconInCode (boolean): Shows programming language icons in code blocks.
   * - true: Displays language icon from DevIcons CDN alongside language name
   * - false: No language icons shown
   * Note: Only works when language is specified in code fence
   * Default: true
   */
  IconInCode: true,

  /**
   * autoHeadingID (boolean): Adds ID to headings automatically by using their name as ID.
   * - true: Adds ID automatically
   * - false: Doesnt add ID automatically
   * Default: true
   */
  autoHeadingID: true
};

/**
 * Updates a configuration setting with a new value.
 * 
 * This function allows runtime modification of Cattown's behavior.
 * Changes take effect immediately and apply to all subsequent operations.
 * 
 * @param {string} setting - The name of the setting to update. Must be one of:
 *   - 'useCustomTheme': Enable/disable custom CSS classes
 *   - 'debugMode': Enable/disable debug logging
 *   - 'enableSanitization': Enable/disable HTML sanitization
 *   - 'LanguageNameInCode': Show/hide language names in code blocks
 *   - 'IconInCode': Show/hide language icons in code blocks
 *   - 'autoHeadingID': Enable/disable automatic heading IDs
 * @param {*} value - The new value to assign. Type should match the setting:
 *   - Boolean for all current settings
 * 
 * @example
 * // Enable debug mode for troubleshooting
 * setSettings('debugMode', true);
 * 
 * // Disable custom styling for plain HTML output
 * setSettings('useCustomTheme', false);
 * 
 * // Turn off sanitization for trusted content (not recommended)
 * setSettings('enableSanitization', false);
 */
export function setSettings(setting, value) {
  if (setting in config) {
    config[setting] = value;
  } else {
    console.warn(`Setting "${setting}" does not exist in config.`);
  }
}

/**
 * Retrieves the current value of a configuration setting.
 * 
 * Use this function to check current configuration values or implement
 * conditional logic based on settings.
 * 
 * @param {string} setting - The name of the setting to retrieve. Must be one of:
 *   - 'useCustomTheme': Returns boolean for CSS class usage
 *   - 'debugMode': Returns boolean for debug logging state
 *   - 'enableSanitization': Returns boolean for sanitization state
 *   - 'LanguageNameInCode': Returns boolean for language name display
 *   - 'IconInCode': Returns boolean for language icon display
 *   - 'autoHeadingID': Returns boolean for automatic heading IDs
 * @returns {*} The current value of the setting, or undefined if setting doesn't exist.
 * 
 * @example
 * // Check if debug mode is enabled
 * const isDebug = getSettings('debugMode');
 * if (isDebug) {
 *   console.log('Debug mode is active');
 * }
 * 
 * // Conditionally apply custom styling
 * const useTheme = getSettings('useCustomTheme');
 * const cssClass = useTheme ? 'ct-parsed custom-element' : '';
 */
export function getSettings(setting) {
  if (setting in config) {
    return config[setting];
  } else {
    console.warn(`Setting "${setting}" does not exist in config.`);
    return undefined;
  }
}

// Default export for convenient importing as single function
export default getSettings;
