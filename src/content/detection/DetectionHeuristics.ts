/** * Scoring function to evaluate the likelihood of an element being a chatbot interface.
 *
 * @param element  The HTML element to score.
 * @returns  A score representing the likelihood of the element being a chatbot interface.
 *           Higher scores indicate a higher likelihood.
 *           Returns 0 if the element does not have a text input area.
 */
export function scoringTreeChatbot(element: HTMLElement): number {
  let score: number = 0;
  let elementToScore = element as HTMLElement;
  /// is element loaded a iframeDocument or shadowRoot and is loaded?
  let allElements = elementToScore.querySelectorAll('*');
  let hasInputArea =
    elementToScore.querySelectorAll(
      'input[type="text"], input:not([type]), textarea, div[contenteditable="true"]',
    ).length > 0;
  //console.log("Has input area: ", hasInputArea);
  if (!hasInputArea) {
    return 0;
  } else {
    score = +10;
  }
  // Get a list of Relant keywords and add them to regex word
  let regex: RegExp = /[\s\S]*(chat|assistant|prompt|conversation)[\s\S]*/;

  allElements.forEach((element) => {
    // Check if there are tags that are relevant for a chatbot
    element.localName.match(regex) ? score++ : null;

    // Check if there are classes name that are relevant for a chatbot
    element.classList.forEach((className) => {
      if (className.match(regex)) {
        score++;
      }
    });

    // Check if there are properties that are relevant for a chatbot
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.match(regex)) {
        score++;
      }
    });

    // get any data-* attributes that are relevant for a chatbot
    for (const dataAtr in (element as HTMLElement).dataset) {
      if (dataAtr.match(regex)) {
        score++;
      }
      if ((element as HTMLElement).dataset[dataAtr]!.match(regex)) {
        score++;
      }
    }
  });

  return score;
}
