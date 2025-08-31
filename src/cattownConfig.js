let config = {
  useCustomTheme: true,      // Enable custom theme usage
  debugMode: false,          // Enable or disable debug mode
  enableSanitization: true,  // Enable input sanitization
  LanguageNameInCode: true,  // Show language name in code blocks
  IconInCode: true           // Show icons in code blocks
};

/**
 * Updates a setting in the config object.
 * @param {string} setting - The name of the setting to update.
 * @param {*} value - The new value to assign to the setting.
 */
export function setSettings(setting, value) {
  if (setting in config) {
    config[setting] = value;
  } else {
    console.warn(`Setting "${setting}" does not exist in config.`);
  }
}

/**
 * Retrieves the value of a given setting from the config object.
 * @param {string} setting - The name of the setting to retrieve.
 * @returns {*} The value of the setting or undefined if it does not exist.
 */
export function getSettings(setting) {
  if (setting in config) {
    return config[setting];
  } else {
    console.warn(`Setting "${setting}" does not exist in config.`);
    return undefined;
  }
}

export default getSettings;
