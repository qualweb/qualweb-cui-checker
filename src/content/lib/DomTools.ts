import { IframeNotAccessibleError } from '../detection/Errors';
import { ChatbotInputElement } from '../interaction/message-sender';
import { containsExactTextXPath } from './XPathTools';

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
    if (currentWindow.frameElement?.tagName === 'IFRAME') {
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
  for (const p of path) {
    if (!p.contains(sibling)) {
      return p;
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

// Verify if element is visible 
function isVisible(el: Element | null): boolean {
  return !!(el && (el as HTMLElement).offsetParent !== null);
}

function isElementInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 && 
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}


export function getFirstElementVisibleFromArray(elements: Element[]): Element | null {
  for (const el of elements) {
    if (isVisible(el)) {
      return el;
    }
  }
  return null;
}


/** Function to pause execution for a given number of milliseconds
 * 
 * @param ms  milliseconds to sleep
 * @returns 
 */
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
/** Function to prioritize text input elements (div, input, textarea)
 *   
 * @param elements Array of elements to prioritize 
 * @returns  The element with highest priority (div > input > textarea)
 */
function priorityTextInput(elements: Element[]): Element {
  const priorityTags = ['TEXTAREA','INPUT','DIV'];
  let topElement: Element | null = null;
  let topPriority = -1;
  for (const element of elements) {
    const tag = element.tagName;
    const priority = priorityTags.indexOf(tag);
    if (priority > topPriority) {
      topPriority = priority;
      topElement = element;
    }
  }
  return topElement ?? elements[0];
}


const nonAIInputKeywords = new Set([
  // -----------------------------------------
  //  ENGLISH
  // -----------------------------------------
  "address", "billing", "city", "comment", "contact", "number", "coupon", "credit",
  "card", "cvv", "date", "dob", "email", "expiry", "fax", "feedback",
  "find", "first", "name", "last", "link", "list", "login", 
  "password", "phone", "pin", "postcode", "promo", "recaptcha", "review",
  "search", "state", "street","tel", "time",
   "url", "user", "username", "website", "zip",

  // -----------------------------------------
  // 🇵🇹 PORTUGUÊS (PT-PT)
  // -----------------------------------------
  "cartão", "crédito", "cidade", "código", "postal",
  "comentário", "consulta","cupão", "data", "nascimento", "desconto", "distrito",
  "filtrar", "lista", "morada", "número", "contacto", "palavra-passe",
  "pesquisa","pesquisar", "primeiro","procura", "procurar", "promoção", "rua", "telemóvel", "telefone", "último",
  "utilizador", "validade", "nome",

]);
export async function detectChatbotInputCrossOrigin():Promise<ChatbotInputElement | null> {


  const inputs = [...document.querySelectorAll('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]')].filter(isVisible);
  console.log("inputs detected",inputs);
  const inputsFiltered = inputs.filter(isElementInViewport).filter(input => !isNonAIInput(input));
  console.log("inputs filtered",inputsFiltered);
  const result  = inputsFiltered.length > 0 ? priorityTextInput(inputsFiltered) as ChatbotInputElement : null;
  if(result){
    console.log("Detected chatbot input element:", result);
    return result;
  }
  // Inputs "prováveis" dentro de iframes cross-origin
 const iframes = [...document.querySelectorAll('iframe')];
  console.log("Found Iframes", iframes);
  let foundClosedIframe = false;
  const inputsFoundInIframes: Element[] = [];
  for (const iframe of iframes) {
    let documentIframe:Document|null = null;
    try{
    documentIframe = iframe.contentDocument || iframe.contentWindow!.document;
    // check if iframe is accessible
    if(!documentIframe || !documentIframe.body){

      throw new Error('Iframe not accessible');
    }
    }catch{
      //TODO: Logic to send to devtools chrome extension
      console.log("Cannot access iframe due to cross-origin restrictions:", iframe);
      foundClosedIframe = true;
      continue;
    }
  
  const inputs = [...documentIframe.querySelectorAll('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]')].filter(isVisible);
  console.log("inputs detected",inputs);
    const inputsFiltered = inputs.filter(isElementInViewport).filter(input => !isNonAIInput(input));
    inputsFoundInIframes.push(...inputsFiltered);
  }
  if(inputsFoundInIframes.length > 0){
    const resultIframe  = priorityTextInput(inputsFoundInIframes) as ChatbotInputElement;
    console.log("Detected chatbot input element in iframe:", resultIframe);
    return resultIframe;
  }else{
    if(foundClosedIframe){
      console.log("Some iframes were not accessible due to cross-origin restrictions.");
      throw new IframeNotAccessibleError('Some iframes were not accessible due to cross-origin restrictions.');
     
    }
    return null;
  }
}


/** Function to check if an element is likely NOT an AI chatbot input
 * 
 * @param el  Element to check
 * @returns  boolean  True if element is likely NOT an AI chatbot input
 */

export function isNonAIInput(el: Element): boolean {
  const allAttributesText = Array.from(el.attributes)
    .map(attr => attr.value)
    .join(' ')
    .toLowerCase();

  const words = allAttributesText.split(/[\s.\-]+/);
  
  for (const word of words) {
    if (nonAIInputKeywords.has(word)) {
      console.log(`Found keyword "${word}" in attributes`);
      return true;
    }
  }
  
  return false;
}
/** Function to check if an element is likely NOT an AI chatbot input
 * 
 * @param el  Element to check
 * @returns  boolean  True if element is likely NOT an AI chatbot input
 */
/*
 export function isNonAIInput(el:Element): boolean {
  return Array.from(el.attributes).some(attr => {
    const val = (attr as any).value;
    return (
      val &&
      nonAIInputKeywords.some(keyword => {
        const found = val.toLowerCase().split(/[\s.\-]+/).includes(keyword);
        if (found) {
          console.log(`Found keyword "${keyword}" in attribute: ${val}`);
        }
        return found;
      })
    );
  });
}
*/
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
  if (attr.name.startsWith('data-') || attr.name.startsWith('aria-')) {
    const key = attr.name;  
    const value = attr.value; 
     if(!isAutoGeneratedValue(value) && value !== "true" && value !== "false" && !/\d/.test(value) && counterData <3){
      selector += `[${key}="${value}"]`;
      counterData++;
    }else if(/\d/.test(value) && counterData <3 ){
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


/**
 * Finds the closest ancestor of a node that does not contain the specified text.
 * @param node  The starting node.
 * @param ignoreText  The text to ignore when searching ancestors.
 * @returns  The closest ancestor element that does not contain the specified text.
 */
export function findAncestralNodeBeforeContaining(node: HTMLElement, ignoreText: string): HTMLElement {
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


export function findButton(element: HTMLElement, clickX: number, clickY: number): HTMLElement | null {
  // Check if element is clickable
  function isClickable(el: HTMLElement): boolean {
    const tag = el.tagName.toLowerCase();

    
    // Common clickable elements
    if (tag === 'button' || tag === 'a') return true;
    
    
    return false;
  }

  // Check if visible
  function isVisible(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  let current: HTMLElement | null = element;
  let depth = 0;
  const MAX_DEPTH = 5;
  const MAX_DISTANCE = 100; // pixels
  
  while (current && depth < MAX_DEPTH) {
    if (isClickable(current) && isVisible(current)) {
      const rect = current.getBoundingClientRect();
      
      // Check if click was reasonably close to the button
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(clickX - centerX, 2) + 
        Math.pow(clickY - centerY, 2)
      );
      
      if (distance <= MAX_DISTANCE) {
        console.log("Found clickable element at depth", depth, "distance", distance.toFixed(2), current);
        return current;
      } else {
        console.log("Found clickable but too far:", distance.toFixed(2), "px");
      }
    }
    
    current = current.parentElement;
    depth++;
  }

  console.log("No clickable element found nearby");
  return null;
}