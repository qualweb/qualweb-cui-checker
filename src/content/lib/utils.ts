export function isNodeTypingInfo(node: Node): boolean {
  return document.evaluate(
    `boolean(.//*[contains(@*, "typing")  or contains(@*, "loading") ] | self::*[contains(@*, "typing") or contains(@*, "loading")])`,
    node,
    null,
    XPathResult.BOOLEAN_TYPE,
    null,
  ).booleanValue;
}

function hasExactText(el: HTMLElement, text: string): boolean {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode.textContent && currentNode.textContent.trim() === text) {
      return true;
    }
  }
  return false;
}

/** Function that checks if Element contains chatbot Response
 *
 * @param node element to check
 * @param selectorMessage selector of chatbot responses
 */
export function isChatBotMessage(
  node: HTMLElement,
  selectorMessage: string,
  lastMessageUser: string,
): boolean {
  if (lastMessageUser) {
    var test = lastMessageUser && hasExactText(node, lastMessageUser);
    if (test) {
      return false;
    }
  }
  const matches = node.matches(selectorMessage) || node.querySelector(selectorMessage);
  return !!matches;
}

export function isContainedInSelector(node: HTMLElement, selector: string): boolean {
  return (
    node instanceof HTMLElement && (node.matches(selector) || node.querySelector(selector) !== null)
  );
}

/**  Function to normalize the text
 *
 * @param text text to normalize
 * @returns
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // replaces multiple spaces/newlines/tabs with a single space
    .trim();
}

export function markQuestion(ownerDocument: Document, question: string, counter: number): void {
  const end = Math.min(100, question.length);
  const slicedQuestion = question.slice(0, end);
  const textNodeResult = document.evaluate(
    `//*[contains(text(), "${slicedQuestion}")]`,
    ownerDocument,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  if (textNodeResult) {
    // Sobe ao nó pai, caso tenha encontrado um nó de texto
    const element =
      textNodeResult.nodeType === Node.TEXT_NODE
        ? textNodeResult.parentElement
        : (textNodeResult as HTMLElement);

    // Adiciona o atributo de identificação à pergunta
    element?.setAttribute('qw-cui-question', counter.toString());
  }
}

export function markResponses(responses: HTMLElement[], counter: number): void {
  responses.forEach((el) => el.setAttribute('qw-cui-response', counter.toString()));
}

export function extractAssistantMessage(responses: HTMLElement[]): string {
  return normalizeText(
    responses
      .map((element) => element.textContent)
      .join('\n')
      .trim(),
  );
}
