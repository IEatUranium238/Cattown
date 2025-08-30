import tokenizer from "./tokenizer.js";
import convertTokensToHTML from "./tokensToHTML.js";
import DOMPurify from "dompurify";
import config from "./../cattownConfig.json";

const isInDebug = config.debugMode;
const useSanitization = config.enableSanitization;

function debugLog(...args) {
  if (!isInDebug) return;
  console.log(...args);
}

function returnHTML(markdown) {
  try {
    debugLog("Cattown - got markdown:");
    debugLog(markdown);

    let tokens = tokenizer(markdown);
    debugLog("Cattown - tokenizer token output:");
    debugLog(tokens);

    let dirtyHTML = convertTokensToHTML(tokens);
    debugLog("Cattown - generated HTML code:");
    debugLog(dirtyHTML);

    if (useSanitization) {
      let cleanHTML = DOMPurify.sanitize(dirtyHTML);
      debugLog("Cattown - sanitized HTML code:");
      debugLog(cleanHTML);
      debugLog("Cattown - done!");
      return cleanHTML;
    } else {
      debugLog("Cattown - done!");
      return dirtyHTML;
    }
  } catch (e) {
    console.error("Cattown - failed to render markdown! Error:");
    console.error(e);
  }
}

export default returnHTML;
