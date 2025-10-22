import { restartTimeOut, startTimeOut } from "../interaction/utils";
import { findElementByExactText } from "../lib/DomTools";
import { documentOwner } from "./Detection";

function findAncestralNodeBeforeContainingTest(node, ignoreText) {
    let current = node;
  let parent = node.parentElement;
 console.log("Antes iteração");
  while (parent) {
      console.log("iteração");
    // se algum descendente do pai contém exatamente o texto, paramos
    if (containsExactTextXPathteste(parent, ignoreText)) {
        console.log("o PARENT tem o texto  ", ignoreText, ' mas o current não tem', current);
      break;
    }

    current = parent;
    parent = parent.parentElement;
  }

  return current; // último ancestral que não contém o texto
}

function containsExactTextXPathteste(container, text) {
  if (!container) return false;

  // XPath para procurar qualquer nó de texto descendente igual a text
  const xpath = `.//text()[normalize-space() = ${JSON.stringify(text)}]`;

  const result = documentOwner.evaluate(
    xpath,
    container,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

 return !!result;; // true se encontrou, false caso contrário
}
/**
 * Observa mutações no DOM para detectar a adição de uma mensagem de chat após simular um input.
 * * @param {Element} nodeTarget O nó DOM a observar (normalmente document.body).
 * @param {string} initialText O texto a procurar (a mensagem enviada).
 * @param {HTMLElement} ignoreInput O elemento de input a ignorar nas mutações.
 * @returns {Promise<HTMLElement>} Uma Promise que resolve com o nó da mensagem adicionada.
 */
export async function detectChatBotResponseMutation(nodeTarget,userElement,initialText) {
    console.log('Detecting chatbot response mutation');
    let timeout ;
    let timeOutCallBack;
    const importantMutations =  new Set();
    return new Promise(async (resolve, reject) => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                timeout = restartTimeOut(3000, timeout, observer, timeOutCallBack);
                if (mutation.type === 'characterData') {
                    
                    let teste = findAncestralNodeBeforeContainingTest(mutation.target,initialText);
                    console.log('Text changed:', mutation.target.textContent);
                    if(teste.textContent.trim() != initialText ){
                
                    importantMutations.add(teste);
                    }
                }

                for (const addedNode of mutation.addedNodes) {
                    // Garante que o nó adicionado é um elemento DOM para o 'contains'
                    if (addedNode.nodeType !== Node.ELEMENT_NODE) {
                        continue; 
                    }
                    const AddedNodeDetection = addedNode as HTMLElement;
                    const result = findElementByExactText(AddedNodeDetection, initialText);

                    const style = window.getComputedStyle(AddedNodeDetection);
                  const visible =
                    style.display !== "none" &&
                    style.visibility !== "hidden" &&
                    style.opacity !== "0";
                 const rect = AddedNodeDetection.getBoundingClientRect();
                  const hasSize = rect.width > 0 && rect.height > 0;
                    
                    if (
                      AddedNodeDetection.tagName != 'BUTTON' &&
                      AddedNodeDetection.textContent &&
                      AddedNodeDetection.textContent.trim() &&
                      !AddedNodeDetection != userElement &&
                      !AddedNodeDetection.contains(result) &&
                      visible &&
                      hasSize &&
                      AddedNodeDetection.textContent &&
                      AddedNodeDetection.textContent.trim() != initialText
                    ) {
                      // resolve com o nó adicionado
                      console.log("Detetou added Node ", AddedNodeDetection);
                      let teste = findAncestralNodeBeforeContainingTest(AddedNodeDetection, initialText);
                      // failsafe
                    
                      console.log("teste Ancestral before ignored element", userElement);
                      importantMutations.add(teste);
                      console.log("mutation addedNode ", AddedNodeDetection);
                    }
                }
            }
        });

        // 3. Configuração da observação
        observer.observe(nodeTarget, {
            childList: true,
            subtree: true,
            characterData: true,
        });
        timeOutCallBack = async () => {
                 
          console.log('Relevant Mutations found', importantMutations);
          resolve(importantMutations.values().next().value)
          observer.disconnect();
        };
        
        // 4. Temporizador de Timeout
        timeout = startTimeOut(5000, observer, timeOutCallBack)
    

        
    });
}