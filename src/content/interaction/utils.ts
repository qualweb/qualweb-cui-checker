export function setLastMessageUser(message: string) {
  lastMessageUser = message;
}
let lastMessageUser: string = '';


export function isNodeTypingInfo(node: Node): boolean {
  return document.evaluate(
    `boolean(.//*[contains(@*, "typing")  or contains(@*, "loading") ] | self::*[contains(@*, "typing") or contains(@*, "loading")])`,
    node,
    null,
    XPathResult.BOOLEAN_TYPE,
    null,
  ).booleanValue;
}

function hasExactText(el, text) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let currentNode;
    while (currentNode = walker.nextNode()) {
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
export function isChatBotMessage(node: HTMLElement, selectorMessage: string): boolean {
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
    node instanceof HTMLElement &&
    (node.matches(selector) || node.querySelector(selector) !== null)
  );
}

export function startTimeOut(
  maxWaitTime: number,
  observer: MutationObserver,
  callback: () => void,
): NodeJS.Timeout {
  return setTimeout(() => {
    observer.disconnect();
    callback();
  }, maxWaitTime);
}

export function restartTimeOut(
  maxWaitTime: number,
  timeout: NodeJS.Timeout,
  observe: MutationObserver,
  callback: () => void,
): NodeJS.Timeout {
  clearTimeout(timeout);
  return startTimeOut(maxWaitTime, observe, callback);
}

export function stopTimeout(timeout: NodeJS.Timeout): void {
  clearTimeout(timeout);
}
