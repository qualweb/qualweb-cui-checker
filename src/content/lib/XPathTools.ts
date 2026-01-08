/** Escapes a string for use in an XPath expression.
 *
 * @param text  The text to escape.
 * @returns  The escaped text suitable for XPath.
 */
function escapeXPathString(text: string): string {
  if (!text.includes("'") && !text.includes('"')) {
    return `'${text}'`;
  }

  const parts = text.split(/(['"])/).filter((part) => part !== '');
  const concatParts = parts.map((part) => {
    if (part === "'") return `"'"`;
    if (part === '"') return `'"'`;
    return `'${part}'`;
  });

  return `concat(${concatParts.join(', ')})`;
}

/** Checks if the container element contains a text node with the exact given text.
 *
 * @param container  The container element in which to search for the text.
 * @param text  The exact text to search for.
 * @returns  True if the text is found, false otherwise.
 * @throws  If the container is null/undefined or if the text is undefined/null/empty string.
 */
export function containsExactTextXPath(container: HTMLElement, text: string): boolean {
  if (!container) throw new Error('Container element cannot be null or undefined');
  if (text === undefined || text === null || text === '')
    throw new Error('Text to find cannot be undefined or null or empty string');
  const escapedText = escapeXPathString(text);

  const xpath = `.//text()[normalize-space(.) = normalize-space(${escapedText})]`;
  try {
    const result = container.ownerDocument.evaluate(
      xpath,
      container,
      null,
      XPathResult.BOOLEAN_TYPE,
      null,
    ).booleanValue;

    return result;
  } catch (error) {
    // TODO: Handle error appropriately
    console.log('XPath evaluation error:', error);
    return false;
  }
}
/** Finds the first element within the container that has the exact given text content.
 *
 * @param container  The container element in which to search for the text.
 * @param text  The exact text to search for.
 * @returns  The first element that matches the exact text, or null if none found.
 */
export function findElementByExactTextContent(container: HTMLElement, text: string): Node | null {
  // Converte o texto para minúsculas e escapa aspas simples, se necessário
  if (!container) throw new Error('Container element cannot be null or undefined');
  if (text === undefined || text === null || text === '')
    throw new Error('Text to find cannot be undefined or null or empty string');
  const escapedText = escapeXPathString(text);
  // XPath will search for text nodes that contains only the entire text provided as text content
  const xpath = `.//*[normalize-space() = normalize-space(${escapedText})]`;

  try {
    const result = container.ownerDocument.evaluate(
      xpath,
      container,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;

    return result;
  } catch {
    return null;
  }
}
/** Finds the microphone button element within the given container using XPath.
 *
 * @param container  The container element in which to search for the microphone button.
 * @returns  The microphone button element if found, otherwise null.
 */
export function findMicrophoneButton(container: HTMLElement): Node | null {
  if (!container) throw new Error('Container element cannot be null or undefined');
  const xpath = `//button[@*[contains(., 'Dictate')] or @*[contains(., 'mic')]]`;

  try {
    const result = container.ownerDocument.evaluate(
      xpath,
      container,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;

    return result;
  } catch {
    return null;
  }
}
