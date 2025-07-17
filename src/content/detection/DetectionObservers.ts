import { sleep } from "../lib/DomTools";
import { simulateInput } from "../interaction/Interaction";
import { scoringTreeChatbot } from "./DetectionHeuristics";

/**
 * 
 * @param nodeTarget 
 * @param initialText 
 * @param ignoreInput 
 * @returns 
 */
export async function detectChatBotPageMutation(nodeTarget:Element,initialText: string, ignoreInput: HTMLElement): Promise<HTMLElement> {
  console.log("Detecting chatbot page mutation");
  
  return new Promise(async (resolve, reject) => {
       
   const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "characterData") {
      console.log("Text changed:", mutation.target.textContent);

      if (mutation.target.textContent === initialText) {
        resolve(mutation.target.parentElement as HTMLElement);
        observer.disconnect();
        clearTimeout(timeout);
        console.log("Chatbot detected via MutationObserver (characterData).");
        return;
      }
    }

    for (const addedNode of mutation.addedNodes) {
      if (
        ignoreInput &&
        (ignoreInput.contains(addedNode) || ignoreInput === mutation.target)
      ) {
        console.log("Ignoring mutation from input element.", mutation.target);
        continue;
      }

      console.log("Added node:", addedNode);

      if (addedNode.textContent?.includes(initialText)) {
        resolve(addedNode as HTMLElement);
        observer.disconnect();
        clearTimeout(timeout);
        console.log("Chatbot detected via MutationObserver (childList).");
        return;
      }
    }
  }
});
    observer.observe(nodeTarget, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    // Simulate input to trigger mutations

    const timeout = setTimeout(() => {
      observer.disconnect();
      console.error("MutationObserver timed out.");
      reject(new Error("MutationObserver timed out."));
    }, 15000);
    await     sleep(500); // Wait for the observer to start
    await simulateInput(initialText, ignoreInput as HTMLInputElement | HTMLTextAreaElement | HTMLDivElement);
  });
}
  


/**
 * 
 * @returns 
 */
export async function detectChatBotPopupMutation(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
      let stopMutationLoop = false;
      for (const mutation of mutations) {
        if (stopMutationLoop) {
          break;
        }
        
        if (mutation.type === "childList") {
          const addedNodes = mutation.addedNodes;
          for (let i = 0; i < addedNodes.length; i++) {
            const node = addedNodes[i] as HTMLElement;
             let resolved = false;
             let score = scoringTreeChatbot(
                        node as HTMLElement
                      );
                       console.log("Score for element: ",node, score);
                      if (score > 10) {
                       
                        resolved = true;
                        stopMutationLoop = true;
                        observer.disconnect();
                        resolve(node);
                      }
          }
        }
        if (mutation.type === "attributes" ) {
          const element = mutation.target as HTMLElement;

           console.log("Mutation detected for element: ", element);
          // Filtrar por estilo específico
          let iframesNested = element.querySelectorAll("iframe");
          // if has iframe and is not display none also check score for them
          if (getComputedStyle(element).display !== "none" && iframesNested.length > 0) {
            let resolved = false;
            for (let i = 0; i < iframesNested.length; i++) {
                if (resolved) {
                  break;
                }
                waitForIframeLoad(iframesNested[i] as HTMLIFrameElement)
                  .then((iframe) => {
                    let iframeContent: Document | null = (
                      iframe as HTMLIFrameElement
                    ).contentDocument;

                    if (iframeContent) {
                      let score = scoringTreeChatbot(
                        iframeContent.body as HTMLElement
                      );

                      if (score > 10) {
                        resolved = true;
                        stopMutationLoop = true;
                        observer.disconnect();
                        resolve(iframeContent.body);
                      }
                    }
                  })
                  .catch((error) => {
                    console.log("Iframe not loaded %s", error);
                  });
                }
            }


             let score = scoringTreeChatbot(element);
              console.log("Mutation detected for element: ", element);
              console.log("Score for element: ", score);
              if (score > 10) {
                stopMutationLoop = true;
                observer.disconnect();
                resolve(element);
            // has iframe?
        
              
            } else {
              // iF element is not a iframe

              let score = scoringTreeChatbot(element);
              console.log("Mutation detected for element: ", element);
              console.log("Score for element: ", score);
              if (score > 10) {
                stopMutationLoop = true;
                observer.disconnect();
                resolve(element);
              }
            }
          }
        }
      
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"], 
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error("MutationObserver timed out."));
    }, 15000);
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

    if (iframeDoc && iframeDoc.readyState === "complete") {
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


