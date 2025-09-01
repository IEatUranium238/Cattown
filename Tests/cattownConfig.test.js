/**
 * CATTOWN CONFIGURATION MODULE TESTS
 * 
 * This test suite covers the configuration management functionality
 * including settings retrieval, modification, and validation.
 */

import { getSettings, setSettings } from '../src/cattownConfig.js';

// Mock console.warn to avoid noise in tests
const originalConsoleWarn = console.warn;
beforeEach(() => {
  console.warn = jest.fn();
  // Reset configuration to defaults
  setSettings('useCustomTheme', true);
  setSettings('debugMode', false);
  setSettings('enableSanitization', true);
  setSettings('LanguageNameInCode', true);
  setSettings('IconInCode', true);
});

afterEach(() => {
  console.warn = originalConsoleWarn;
});

describe('Cattown Configuration Module', () => {
  describe('getSettings', () => {
    test('should return default values for all settings', () => {
      expect(getSettings('useCustomTheme')).toBe(true);
      expect(getSettings('debugMode')).toBe(false);
      expect(getSettings('enableSanitization')).toBe(true);
      expect(getSettings('LanguageNameInCode')).toBe(true);
      expect(getSettings('IconInCode')).toBe(true);
    });

    test('should return undefined for non-existent settings', () => {
      expect(getSettings('nonExistentSetting')).toBeUndefined();
    });

    test('should handle null and undefined parameters', () => {
      expect(getSettings(null)).toBeUndefined();
      expect(getSettings(undefined)).toBeUndefined();
    });

    test('should handle empty string parameter', () => {
      expect(getSettings('')).toBeUndefined();
    });
  });

  describe('setSettings', () => {
    test('should update useCustomTheme setting', () => {
      setSettings('useCustomTheme', false);
      expect(getSettings('useCustomTheme')).toBe(false);
      
      setSettings('useCustomTheme', true);
      expect(getSettings('useCustomTheme')).toBe(true);
    });

    test('should update debugMode setting', () => {
      setSettings('debugMode', true);
      expect(getSettings('debugMode')).toBe(true);
      
      setSettings('debugMode', false);
      expect(getSettings('debugMode')).toBe(false);
    });

    test('should update enableSanitization setting', () => {
      setSettings('enableSanitization', false);
      expect(getSettings('enableSanitization')).toBe(false);
      
      setSettings('enableSanitization', true);
      expect(getSettings('enableSanitization')).toBe(true);
    });

    test('should update LanguageNameInCode setting', () => {
      setSettings('LanguageNameInCode', false);
      expect(getSettings('LanguageNameInCode')).toBe(false);
      
      setSettings('LanguageNameInCode', true);
      expect(getSettings('LanguageNameInCode')).toBe(true);
    });

    test('should update IconInCode setting', () => {
      setSettings('IconInCode', false);
      expect(getSettings('IconInCode')).toBe(false);
      
      setSettings('IconInCode', true);
      expect(getSettings('IconInCode')).toBe(true);
    });

    test('should warn for non-existent settings', () => {
      setSettings('nonExistentSetting', true);
      expect(console.warn).toHaveBeenCalledWith('Setting "nonExistentSetting" does not exist in config.');
    });

    test('should warn for null setting name', () => {
      setSettings(null, true);
      expect(console.warn).toHaveBeenCalledWith('Setting "null" does not exist in config.');
    });

    test('should warn for undefined setting name', () => {
      setSettings(undefined, true);
      expect(console.warn).toHaveBeenCalledWith('Setting "undefined" does not exist in config.');
    });

    test('should warn for empty string setting name', () => {
      setSettings('', true);
      expect(console.warn).toHaveBeenCalledWith('Setting "" does not exist in config.');
    });

    test('should accept various value types for valid settings', () => {
      // Test with different boolean values
      setSettings('debugMode', true);
      expect(getSettings('debugMode')).toBe(true);
      
      setSettings('debugMode', false);
      expect(getSettings('debugMode')).toBe(false);
    });

    test('should persist settings across multiple calls', () => {
      setSettings('debugMode', true);
      setSettings('useCustomTheme', false);
      
      expect(getSettings('debugMode')).toBe(true);
      expect(getSettings('useCustomTheme')).toBe(false);
      
      // Verify other settings remain unchanged
      expect(getSettings('enableSanitization')).toBe(true);
      expect(getSettings('LanguageNameInCode')).toBe(true);
      expect(getSettings('IconInCode')).toBe(true);
    });

    test('should handle rapid setting changes', () => {
      for (let i = 0; i < 10; i++) {
        setSettings('debugMode', i % 2 === 0);
        expect(getSettings('debugMode')).toBe(i % 2 === 0);
      }
    });
  });

  describe('Configuration Integration', () => {
    test('should maintain settings state across module imports', () => {
      // This test verifies that the configuration is properly shared
      // across different parts of the application
      setSettings('debugMode', true);
      expect(getSettings('debugMode')).toBe(true);
      
      // Simulate a new import scenario
      const { getSettings: getSettings2, setSettings: setSettings2 } = require('../src/cattownConfig.js');
      expect(getSettings2('debugMode')).toBe(true);
      
      setSettings2('debugMode', false);
      expect(getSettings('debugMode')).toBe(false);
    });

    test('should handle all boolean combinations', () => {
      const settings = ['useCustomTheme', 'debugMode', 'enableSanitization', 'LanguageNameInCode', 'IconInCode'];
      
      // Test all false
      settings.forEach(setting => setSettings(setting, false));
      settings.forEach(setting => expect(getSettings(setting)).toBe(false));
      
      // Test all true
      settings.forEach(setting => setSettings(setting, true));
      settings.forEach(setting => expect(getSettings(setting)).toBe(true));
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle setting names with special characters', () => {
      setSettings('setting-with-dashes', true);
      expect(console.warn).toHaveBeenCalledWith('Setting "setting-with-dashes" does not exist in config.');
    });

    test('should handle setting names with spaces', () => {
      setSettings('setting with spaces', true);
      expect(console.warn).toHaveBeenCalledWith('Setting "setting with spaces" does not exist in config.');
    });

    test('should handle numeric setting names', () => {
      setSettings(123, true);
      expect(console.warn).toHaveBeenCalledWith('Setting "123" does not exist in config.');
    });

    test('should handle object setting names', () => {
      setSettings({}, true);
      expect(console.warn).toHaveBeenCalledWith('Setting "[object Object]" does not exist in config.');
    });

    test('should handle function setting names', () => {
      setSettings(() => {}, true);
      expect(console.warn).toHaveBeenCalledWith('Setting "function () {}" does not exist in config.');
    });
  });

  describe('Configuration Validation', () => {
    test('should only accept valid setting names', () => {
      const validSettings = ['useCustomTheme', 'debugMode', 'enableSanitization', 'LanguageNameInCode', 'IconInCode'];
      const invalidSettings = ['invalid', 'test', 'config', 'setting'];
      
      validSettings.forEach(setting => {
        setSettings(setting, false);
        expect(console.warn).not.toHaveBeenCalled();
      });
      
      invalidSettings.forEach(setting => {
        setSettings(setting, false);
        expect(console.warn).toHaveBeenCalledWith(`Setting "${setting}" does not exist in config.`);
      });
    });

    test('should maintain default values for unmodified settings', () => {
      // Modify one setting
      setSettings('debugMode', true);
      
      // Verify others remain at defaults
      expect(getSettings('useCustomTheme')).toBe(true);
      expect(getSettings('enableSanitization')).toBe(true);
      expect(getSettings('LanguageNameInCode')).toBe(true);
      expect(getSettings('IconInCode')).toBe(true);
    });
  });
});
