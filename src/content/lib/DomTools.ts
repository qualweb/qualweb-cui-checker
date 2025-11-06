
import { ChatbotInputElement } from "../interaction/message-sender";

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
function isRandomValue(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) // UUID
    || /^[0-9a-f]{16,}$/i.test(value) // hashes longos
    || /^\d{10,}$/.test(value);       // timestamps longos
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


export function findScrollable(element) {
  // Função interna para verificar se é scrollable
  const isScrollable = el => {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const canScrollY = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
    const canScrollX = (overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth;
    return canScrollY || canScrollX;
  };

  if (isScrollable(element)) {
    return element;
  }

  for (let child of element.children) {
    const scrollableDescendant = findScrollable(child);
    if (scrollableDescendant) return scrollableDescendant;
  }

  return null; 
}


export function detectChatbotInputCrossOrigin():ChatbotInputElement | null {
  function isCandidateIframe(iframe) {
    const style = window.getComputedStyle(iframe);
    return isVisible(iframe) && /fixed|sticky/.test(style.position);
  }

  // Inputs do documento principal
  let topInput:Element|null = null;
  let topScore = -Infinity;
  const nonAIInputKeywords = [
    "email", "username", "user", "login", "password", "pin", "token",
    "first name", "last name", "full name", "dob", "date of birth",
    "address", "street", "city", "state", "zip", "postcode",
    "phone", "mobile", "fax", "contact number",
    "credit card", "cvv", "expiry", "paypal", "billing",
    "subscribe", "newsletter", "coupon", "promo", "discount",
    "search", "find", "filter", "query", "sort",
    "captcha", "recaptcha", "verification code", "security code",
    "submit", "feedback", "comment",
    "upload", "file", "attachment",
    "url", "website", "link",
    "rating", "stars", "vote", "review","list",'date'
  ];
function isNonAIInput(el) {
  return Array.from(el.attributes).some(attr => {
    const val = (attr as any).value;
    return (
      val &&
      nonAIInputKeywords.some(keyword => {
        const found = val.toLowerCase().includes(keyword);
        if (found) {
          console.log(`Found keyword "${keyword}" in attribute: ${val}`);
        }
        return found;
      })
    );
  });
}
  const inputs = [...document.querySelectorAll('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]')].filter(isVisible);
  console.log("inputs detected",inputs);
  for (const input of inputs) {
    const rect = input.getBoundingClientRect();
    const distance = Math.hypot(window.innerWidth - rect.right, window.innerHeight - rect.bottom);
    const score = -distance / 1000; // só posição
    console.log("distance input",input, " = ", distance," score= ",score);

     
    const finalScore = isNonAIInput(input) ? score - 1000 : score + 1000; // penaliza se não for candidato
    console.log("Score of ", input, " = ", finalScore);
  if (finalScore > topScore) {
    topScore = finalScore;
    topInput = input;
  }
  }

  // Inputs "prováveis" dentro de iframes cross-origin
  const iframes = [...document.querySelectorAll('iframe')];
  console.log("Found Iframes", iframes);
  for (const iframe of iframes) {
    let documentIframe:Document|null = null;
    try{
    documentIframe = iframe.contentDocument || iframe.contentWindow!.document;
    }catch(e){
      // Logic to send to devtools chrome extension
      continue;
    }
      const inputs = [...documentIframe.querySelectorAll('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]')].filter(isVisible);
  console.log("inputs detected",inputs);
  for (const input of inputs) {
    const rect = input.getBoundingClientRect();
    const distance = Math.hypot(window.innerWidth - rect.right, window.innerHeight - rect.bottom);
    const score = -distance / 1000; // só posição

     
    const finalScore = isNonAIInput(input) ? score - 1000 : score + 1000; 

    if (finalScore > 0) {
      console.log("Score of ", input, " = ", finalScore);
    }
  if (finalScore > topScore) {
    topScore = finalScore;
    topInput = input;
  }
  }
  }
  if(topScore > 0){
    console.log("Existe  um input com mais de 0")
    return topInput as ChatbotInputElement;
  }else{
    return null;
  }
}



/**
 * Gera um seletor CSS para agrupamento (classes, atributos).
 * 
 * @param {Element} element 
 * @returns {string | null} 
 */
export function getGroupSelectorRelative(element) {
  if (!element) return null;

  // Se a tag é custom (tem um "-")
  if (element.tagName.includes('-')) {
    return element.tagName.toLowerCase();
  }
  let selector = element.tagName.toLowerCase();

  let counterData = 0;
  // first try data-* attributes
  Object.values(element.attributes).forEach((attr:any) => {
  if (attr.name.startsWith('data-')) {
    const key = attr.name;  
    const value = attr.value; 
     if(!isAutoGeneratedValue(value) && value !== "true" && value !== "false" && !/\d/.test(value) && counterData <2 ){
      selector += `[${key}="${value}"]`;
      counterData++;
    }else if(/\d/.test(value) && counterData <2 ){
      selector += `[${key}]`; 
       counterData++;
    }
  }
  });
  if(selector.length > element.tagName.length) return selector;
  // if not, try classes 
  element.classList.forEach(cls =>{
    if(!isFrameworkClass(cls)){
          selector += `.${escapeCSS(cls)}`;
    }
  });
  return selector;

  // if not found, it should relate to custom attributes
}
function isAutoGeneratedValue(value) {
  if (!value || typeof value !== 'string') return false;

  // Numérico longo (IDs sequenciais ou random)
  if (/^\d{3,}$/.test(value)) return true;

  //  UUID 
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return true;


  if (value.length > 20 && /^[A-Za-z0-9+/=]+$/.test(value)) return true;

 
  if (/^(react|ng|vue|css|Mui|ant|chakra|p-|sc-|module-)-?\d*/i.test(value)) return true;

  // Texto com entropia alta (muitas letras maiúsculas/minúsculas/números especiais)
  if (entropy(value) > 3.5) return true;

  // Se não bate em nenhum padrão  considera estável
  return false;
}

// calcula entropia aproximada de uma string
function entropy(str) {
  const freq = {};
  for (const char of str) freq[char] = (freq[char] || 0) + 1;
  let ent = 0;
  for (const char in freq) {
    const p = freq[char] / str.length;
    ent -= p * Math.log2(p);
  }
  return ent;
}

function isFrameworkClass(cls) {
  return /^(m-|mt-|mb-|ml-|mr-|p-|pt-|pb-|pl-|pr-|text-|bg-|flex|grid|gap-|col-|row-|w-|h-|rounded-|ant-|Mui|chakra-|css-|p-)/.test(cls);
}

function escapeCSS(str) {
  // Escapa todos os caracteres especiais que podem causar erro no querySelector
  return str.replace(/([ !"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}



export function findElementByExactText(container,text) {
    // Converte o texto para minúsculas e escapa aspas simples, se necessário
  
     const xpath = `.//*[normalize-space() = '${text}']`;
  
    const result = container.ownerDocument.evaluate(
        xpath,
        container,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;

    return result; 
}

export function findMicrophoneButton(container) {

    const xpath = `//button[@*[contains(., 'Dictate')] or @*[contains(., 'mic')]]`;
  
    const result = container.ownerDocument.evaluate(
        xpath,
        container,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    
    return result; 
}


export function findAncestralNodeBeforeContaining(node, ignoreText) {
    let current = node;
  let parent = node.parentElement;
 console.log("Antes iteração");
  while (parent) {
      console.log("iteração");
    // se algum descendente do pai contém exatamente o texto, paramos
    if (containsExactTextXPath(parent, ignoreText)) {
        console.log("o PARENT tem o texto  ", ignoreText, ' mas o current não tem', current);
      break;
    }

    current = parent;
    parent = parent.parentElement;
  }

  return current; // último ancestral que não contém o texto
}


export function containsExactTextXPath(container, text) {
  if (!container) return false;

  // XPath para procurar qualquer nó de texto descendente igual a text
  const xpath = `.//text()[normalize-space() = ${JSON.stringify(text)}]`;

  const result = container.ownerDocument.evaluate(
    xpath,
    container,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

 return !!result;; // true se encontrou, false caso contrário
}

export function  getParentIframeElement(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        if (iframe.contentDocument?.contains(element)) {
          return iframe;
        }
      } catch {
        continue;
      }
    }
    return null;
  }

   export function getIframeSelector(inputElement: ChatbotInputElement): string | null {
    if (inputElement.ownerDocument === document) return null;
    const iframe = getParentIframeElement(inputElement);
    return iframe ? getUniqueSelector(iframe) : null;
  }