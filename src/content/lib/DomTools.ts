export function getUniqueSelector(element: Element): string | null {
  if (!element) return null;
  const path: string[] = [];
  let el: Element | null = element;
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector: string = el.nodeName.toLowerCase();

    if (el.id) {
      selector += `#${el.id}`;
      path.unshift(selector);
      break;
    } else {
      let sib: Element | null = el,
        nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() === selector) nth++;
      }
      selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    el = el.parentNode as Element | null;
  }

  return path.join(' > ');
}

export function isInsideIframe(element: Element): boolean {
  let currentWindow: Window | null = element.ownerDocument.defaultView;

  while (currentWindow && currentWindow !== window.top) {
    if (currentWindow.frameElement && currentWindow.frameElement.tagName === 'IFRAME') {
      return true;
    }
    currentWindow = currentWindow.parent;
  }

  return false;
}
export function findDeepestNodeWithoutSibling(
  root: Element,
  elemTarget: Element,
  sibling: Element,
): Element | null {
  let path: Element[] = [];
  let current: Element | null = elemTarget;

  // Construir caminho desde elemTarget até root
  while (current && root.contains(current)) {
    path.unshift(current);
    if (current === root) break;
    current = current.parentElement;
  }

  // Percorrer caminho de root para baixo
  for (let i = 0; i < path.length; i++) {
    const node = path[i];
    if (!node.contains(sibling)) {
      return node;
    }
  }

  return null;
}

export function findLowestCommonAncestorDOM(elem1: Element, elem2: Element): Element | null {
  const ancestors = new Set();

  let current: Element | null = elem1;
  while (current) {
    ancestors.add(current);
    current = current.parentElement;
  }

  current = elem2;
  while (current) {
    if (ancestors.has(current)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

function isVisible(el: Element | null): boolean {
  return !!(el && (el as HTMLElement).offsetParent !== null);
}

export function getFirstElementVisibleFromArray(elements: Element[]): Element | null {
  for (const el of elements) {
    if (isVisible(el)) {
      return el;
    }
  }
  return null;
}

/**Function to clean HTML to reduce size of tokens sent to LLM
 * @param htmlTree - HTML element tree to clean
 * @returns cleaned HTML string
 */

export function cleanHTML(htmlTree: HTMLElement): string {
  let regexRellevant: RegExp = /[\s\S]*(scroll|chat)[\s\S]*/;

  let irrelevantTags = [
    'header',
    'footer',
    'img',
    'svg',
    'td',
    'table',
    'tr',
    'td',
    'script',
    'style',
    'link',
    'noscript',
    'iframe',
    'object',
    'embed',
  ];
  let clonedDomTree = htmlTree.cloneNode(true) as HTMLElement;

  // encurtar texto em <p> e <span> para 100 caracteres and add ... to the end
  clonedDomTree.querySelectorAll('p, span,div').forEach((element) => {
    if (element.textContent!.length > 100) {
      // Iterate over the child nodes and modify only the text nodes
      let totalLength = 0;
      const childNodes = Array.from(element.childNodes); // Convert NodeList to an array

      childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          // Check if it's a text node
          const textContent = child.textContent!;
          totalLength += textContent.length;

          // Shorten text if total length exceeds 100 characters
          if (totalLength > 100) {
            const excessLength = totalLength - 100;
            child.textContent = textContent.slice(0, textContent.length - excessLength) + '...';
          }
        }
      });
    }
  });

  // remover table td e tr
  // Remove tags that are not relevant
  clonedDomTree.querySelectorAll(irrelevantTags.join(',')).forEach((element) => element.remove());

  // Remove regular comments
  clonedDomTree.innerHTML = clonedDomTree.innerHTML.replace(/<!--[\s\S]*?-->/g, '');

  // Remove conditional comments (IE-specific)
  clonedDomTree.innerHTML = clonedDomTree.innerHTML.replace(
    /<!--[^\]]*?\[if[^\]]*?\]>[\s\S]*?<!\[endif\]-->/g,
    '',
  );

  // remove all attributes that are not relevant
  let relevantAttributes = [
    'id',
    'class',
    'contenteditable',
    //"data-*",
    'tabindex',
    'role',
  ];

  clonedDomTree.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      if (!relevantAttributes.includes(attr.name) && !attr.name.startsWith('data-')) {
        if (
          (!attr.name.match(regexRellevant) && !attr.value.match(regexRellevant)) ||
          attr.name === 'src'
        ) {
          element.removeAttribute(attr.name);
        }
      }
    });
  });

  let result = clonedDomTree.innerHTML.replace(/\s*(<[^>]+>)\s*/g, ' $1 ');

  return result;
}

// TODO: Afinar o regex para remover apenas os caracteres especiais necessários de acordo com regras de seletores CSS
// esta a remover > e outros caracteres que não são necessários
export function escapeCssSelector(selector: string): string {
  return selector.replace(/([,\/:;?@^`{|}~])/g, '\\$1');
}

export function clearDotIfCustomTagSelector(selector: string): string {
  if (selector.startsWith('.')) {
    return selector.slice(1);
  }
  return selector;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
