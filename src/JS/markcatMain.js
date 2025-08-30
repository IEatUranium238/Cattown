import tokeniser from "./tokeniser.js";
import convertTokensToHTML from "./tokensToHTML.js";

const body = document.querySelector("body");

function RetrunRenderedHTML(markdown) {
  let tokens = tokeniser(markdown);
  let HTML = convertTokensToHTML(tokens)
  body.innerHTML = HTML;
}

export default RetrunRenderedHTML;