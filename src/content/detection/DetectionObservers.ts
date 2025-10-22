import { findElementByExactText, sleep } from '../lib/DomTools';
import { scoringTreeChatbot } from './DetectionHeuristics';
import { simulateInput } from '../interaction/message-sender';

/**
 *
 * @param nodeTarget
 * @param initialText
 * @param ignoreInput
 * @returns
 */
export async function detectChatBotPageMutation(nodeTarget, initialText, ignoreInput):Promise<HTMLElement|null> {
    console.log('Detecting chatbot page mutation');

    return new Promise(async (resolve, reject) => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'characterData') {
                    console.log('Text changed:', mutation.target.textContent);

                    if (mutation.target.textContent === initialText) {
                        // resolve com o parentElement, como é alteração de texto
                        resolve(mutation.target.parentElement); 
                        observer.disconnect();
                        clearTimeout(timeout);
                        return;
                    }
                }

                for (const addedNode of mutation.addedNodes) {
                    // Garante que o nó adicionado é um elemento DOM para o 'contains'
                    if (addedNode.nodeType !== Node.ELEMENT_NODE) {
                        continue; 
                    }

                    // Ignorar mutação se for dentro do elemento de input ou caso o addedNode contenha o ignoreInput
                    if (ignoreInput && (ignoreInput.contains(addedNode) || addedNode.contains(ignoreInput) || ignoreInput === mutation.target)) {
                        continue;
                    }

                    // Verifica se o conteúdo de texto inclui a mensagem inicial
                    
                    const result = findElementByExactText(addedNode, initialText);
                    if(result && (addedNode as HTMLElement).tagName != 'BUTTON'){
                        // resolve com o nó adicionado
                
                        console.log("Found ",addedNode);
                        resolve(addedNode as HTMLElement);
                        observer.disconnect();
                        clearTimeout(timeout);
                        return;
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
        
        // 4. Temporizador de Timeout
        const timeout = setTimeout(() => {
            observer.disconnect();
            console.error('MutationObserver timed out.');
            reject(new Error('MutationObserver timed out.'));
        }, 15000);

        // 5. Simular a ação (deve ser chamada após o observer estar ativo)
        await sleep(1000); // Espera que o observer comece
        await simulateInput(initialText, ignoreInput);
        
    });
}

/**
 *
 * @param iframe
 * @returns
 */
function waitForIframeLoad(iframe): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    if (iframeDoc && iframeDoc.readyState === 'complete') {
      // Se já está carregado

      resolve(iframe);
    } else {
      /*       
        console.log("Iframe was not loaded, waiting for load event");
          iframe.addEventListener("load", function onLoad() {
              iframe.removeEventListener("load", onLoad); 
              resolve(iframe);
          });

          setTimeout(() => reject(new Error("Iframe load timed out.")), 100000);
          */
      resolve(iframe);
    }
  });
}
