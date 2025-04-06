
import { LocalLLMResponse, sendPromptRequestCorrection, sendPromptTLocalLLM } from "../assistant-interaction/detection";

import {
  ChatBotInterface,
} from "../utils/types";
import { chatbotInterface } from "./Detection";

/**Function to clean HTML to reduce size of tokens sent to LLM
 * @param htmlTree - HTML element tree to clean
 * @returns cleaned HTML string
 */

export function cleanHTML(htmlTree: HTMLElement): string {
  let regexRellevant: RegExp = /[\s\S]*(scroll|chat)[\s\S]*/;


  let irrelevantTags = [
    "header",
    "footer",
    "img",
    "svg",
    "td",
    "table",
    "tr",
    "td",
    "script",
    "style",
    "link",
    "noscript",
    "iframe",
    "object",
    "embed",
  ];
  let clonedDomTree = htmlTree.cloneNode(true) as HTMLElement;

  // encurtar texto em <p> e <span> para 100 caracteres and add ... to the end
  clonedDomTree.querySelectorAll("p, span,div").forEach((element) => {
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
            child.textContent =
              textContent.slice(0, textContent.length - excessLength) + "...";
          }
        }
      });
    }
  });

  // remover table td e tr
  // Remove tags that are not relevant
  clonedDomTree
    .querySelectorAll(irrelevantTags.join(","))
    .forEach((element) => element.remove());

  // Remove regular comments
  clonedDomTree.innerHTML = clonedDomTree.innerHTML.replace(
    /<!--[\s\S]*?-->/g,
    ""
  );

  // Remove conditional comments (IE-specific)
  clonedDomTree.innerHTML = clonedDomTree.innerHTML.replace(
    /<!--[^\]]*?\[if[^\]]*?\]>[\s\S]*?<!\[endif\]-->/g,
    ""
  );

  // remove all attributes that are not relevant
  let relevantAttributes = [
    "id",
    "class",
    "contenteditable",
    "data-*",
    "tabindex",
    "role",
  ];

  clonedDomTree.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      if (!relevantAttributes.includes(attr.name)) {
        if (
          (!attr.name.match(regexRellevant) &&
            !attr.value.match(regexRellevant)) ||
          attr.name === "src"
        ) {
          element.removeAttribute(attr.name);
        }
      }
    });
  });

  let result = clonedDomTree.innerHTML.replace(/\s*(<[^>]+>)\s*/g, " $1 ");

  return result;
}

// Function to get element by Xpath
function getElementByXpath(
  path: string,
  documentChatbot: Document
): HTMLElement | null {
  return documentChatbot.evaluate(
    path,
    documentChatbot,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue as HTMLElement;
}
function validateMessagesSelector(documentOwner:Document,selector:string):string {
  let elements = documentOwner.querySelectorAll(selector);
  if(elements.length > 0){
    return selector;
  }else{
    if(selector.startsWith(".")){
      let selectorCorrected = selector.slice(1);
      elements = documentOwner.querySelectorAll(selectorCorrected);
      if(elements.length > 0){
        return selectorCorrected;
      }
    }
  }
  return "";
  
}
export function selectElementSafely(documentOwner:Document,selector:string) {
  try {
    let element = documentOwner.querySelector(selector);
    if (element) {
      return element;
    } else {
      if(selector.startsWith(".")){
        let selectorCorrected = selector.slice(1);
        element = documentOwner.querySelector(selectorCorrected);
        return element;
      }
      console.warn(`querySelector failed: ${selector}`);
      return null;
    }
  } catch (error) {
    console.warn(`querySelector error: ${selector}`, error);

    // Attempt to use document.getElementById as a fallback
    if (selector.startsWith("#")) {
      try {
        const id = selector.slice(1); // Remove the '#'
        const elementById = documentOwner.getElementById(id);
        if (elementById) {
          return elementById;
        } else {
          console.warn(`getElementById failed: ${id}`);
          return null;
        }
      } catch (idError) {
        console.warn(`getElementById error: ${selector}`, idError);
        return null;
      }
    }
    return null;
  }
}

export async function identifyElementsChatbot(
  element: string,
  documentChatbot: Document
): Promise<ChatBotInterface> {
  return new Promise((resolve, reject) => {
    let LLMResponse: LocalLLMResponse | null = null;

    sendPromptTLocalLLM(element).then((response: LocalLLMResponse) => {
      let chatbotInterface:ChatBotInterface = {
        windowElement: null,
        inputElement: null,
        messagesSelector: "",
        dialogElement: null,
        microphoneElement: null,
        selectors: {
          window: [],
          dialog: [],
          messages: [],
          input: [],
          microphone: [],
        },
      };
      console.log("Response from LLM", response);

      LLMResponse = response;
      if (LLMResponse.main_parent_window) {
        chatbotInterface.windowElement = selectElementSafely(documentChatbot, LLMResponse.main_parent_window) as HTMLElement;
          chatbotInterface.selectors.window.push(LLMResponse.main_parent_window);
      }

      if (LLMResponse.text_input_element) {
        chatbotInterface.inputElement = selectElementSafely(documentChatbot,
          LLMResponse.text_input_element
        ) as HTMLElement;
        chatbotInterface.selectors.input.push(LLMResponse.text_input_element);
      }
      if (LLMResponse.chat_conversation_window) {
        chatbotInterface.dialogElement = selectElementSafely(documentChatbot,
          LLMResponse.chat_conversation_window
        ) as HTMLElement;
        chatbotInterface.selectors.dialog.push(LLMResponse.chat_conversation_window);
      }
      if (LLMResponse.chatbot_message_element) {

        chatbotInterface.messagesSelector = validateMessagesSelector(documentChatbot,LLMResponse.chatbot_message_element);
        chatbotInterface.selectors.messages.push(LLMResponse.chatbot_message_element);
      }
      if (LLMResponse.microphone_button) {
        chatbotInterface.microphoneElement = selectElementSafely(documentChatbot,
          LLMResponse.microphone_button
        ) as HTMLElement;
        chatbotInterface.selectors.microphone.push(LLMResponse.microphone_button);
      }
      resolve(chatbotInterface);
    });
  });
}

export async function correctElementChatbot(
  element: string,
  documentChatbot: Document,
  elementName: string
): Promise<ChatBotInterface> {
  return new Promise((resolve, reject) => {
    let LLMResponse: LocalLLMResponse | null = null;
    let wrongSelector = "";
    switch (elementName) {
      case "windowElement":
        wrongSelector ="main_parent_window is not " + chatbotInterface!.selectors.window[0];
        break;
      case "inputElement":
        wrongSelector +="main_parent_window is " + chatbotInterface!.selectors.window[0];
        wrongSelector +="\ntext_input_element is not " + chatbotInterface!.selectors.input[0];
        break;
      case "dialogElement":
        wrongSelector +="main_parent_window is " +chatbotInterface!.selectors.window[0];
        wrongSelector +="\ntext_input_element is " + chatbotInterface!.selectors.input[0];
        wrongSelector +="\nchat_conversation_window is not " + chatbotInterface!.selectors.dialog[0];
        break;
      case "messagesSelector":
        wrongSelector +="main_parent_window is "+ chatbotInterface!.selectors.window[0];
        wrongSelector +="\ntext_input_element is " + chatbotInterface!.selectors.input[0];
        wrongSelector +="\nchat_conversation_window is " + chatbotInterface!.selectors.dialog[0];
        wrongSelector += "\nchatbot_message_element is not "+ chatbotInterface!.selectors.messages[0];
        break;
      case "microphoneElement":
        wrongSelector +="main_parent_window is "+ chatbotInterface!.selectors.window[0];
        wrongSelector +="\ntext_input_element is " + chatbotInterface!.selectors.input[0];
        wrongSelector +="\nchat_conversation_window is " + chatbotInterface!.selectors.dialog[0];
        wrongSelector += "\nchatbot_message_element is "+ chatbotInterface!.selectors.messages[0];
        wrongSelector += "\nmicrophone_button is not "+ chatbotInterface!.selectors.microphone[0];
        break;
    }

    sendPromptRequestCorrection(element,wrongSelector).then((response: LocalLLMResponse) => {
      LLMResponse = response;
      console.log("Response from LLM", LLMResponse);
      switch (elementName) {
        case "windowElement":
          if (LLMResponse.main_parent_window) {
            let windowElement = selectElementSafely(
              documentChatbot,
              LLMResponse.main_parent_window)

            if (windowElement) {
              chatbotInterface!.windowElement = windowElement as HTMLElement;
              chatbotInterface!.selectors.window[0] = LLMResponse.main_parent_window;
            }
          }
          break;
        case "inputElement":
          if (LLMResponse.text_input_element) {
            let inputElement =selectElementSafely(
              documentChatbot,
              LLMResponse.text_input_element!)

            if (inputElement) {
              chatbotInterface!.inputElement = inputElement as HTMLElement;
            }
          }
          break;
        case "dialogElement":
          let dialogElement =selectElementSafely(
            documentChatbot,
            LLMResponse.chat_conversation_window!);
          if (dialogElement) {
              chatbotInterface!.dialogElement = dialogElement as HTMLElement;
          }

          break;
        case "messagesSelector":
          if (LLMResponse.chatbot_message_element) {
            let chatbotElement = selectElementSafely(
              documentChatbot,
              LLMResponse.chatbot_message_element!);

            if (chatbotElement) {
              chatbotInterface!.messagesSelector = LLMResponse.chatbot_message_element;
            }
          }
          break;
        case "microphoneElement":
          if (LLMResponse.microphone_button) {
            let microphoneElement = selectElementSafely(
              documentChatbot,
              LLMResponse.microphone_button!);
            if (microphoneElement) {
              chatbotInterface!.microphoneElement = microphoneElement as HTMLElement;
            }
          }
          break;
      }


      chatbotInterface!.selectors.dialog.push(LLMResponse.chat_conversation_window!);
      chatbotInterface!.selectors.messages.push(LLMResponse.chatbot_message_element!);
      chatbotInterface!.selectors.input.push(LLMResponse.text_input_element!);
      
      chatbotInterface!.selectors.microphone.push(LLMResponse!.microphone_button || "");
      resolve(chatbotInterface!);
    });
  });
}

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

export async function detectChatBotPopupMutation(): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
      let stopMutationLoop = false;
      for (const mutation of mutations) {
        if (stopMutationLoop) {
          break;
        }
        if (mutation.type === "attributes") {
          const element = mutation.target as HTMLElement;

          // Filtrar por estilo específico
          if (getComputedStyle(element).display !== "none") {
            if (element.querySelectorAll("iframe").length > 0) {
              let iframes = element.querySelectorAll("iframe");
        

              let resolved = false;
              for (let i = 0; i < iframes.length; i++) {
                if (resolved) {
                  break;
                }
                waitForIframeLoad(iframes[i] as HTMLIFrameElement)
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
            } else {
              // iF element is not a iframe
              let score = scoringTreeChatbot(element);

              if (score > 10) {
                stopMutationLoop = true;
                observer.disconnect();
                resolve(element);
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      attributes: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject();
    }, 15000);
  });
}

function scoringTreeChatbot(element: HTMLElement): number {
  let score: number = 0;
  let elementToScore = element as HTMLElement;
  /// is element loaded a iframeDocument or shadowRoot and is loaded?
  let allElements = elementToScore.querySelectorAll("*");
  let hasInputArea =
    elementToScore.querySelectorAll(
      "input[type='text'], textarea, div[contenteditable='true']"
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
