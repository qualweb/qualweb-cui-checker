import { sendMessageToBackground } from '../content';
import { chatbotInterface } from '../detection/Detection';


export type ChatbotInputElement = HTMLInputElement | HTMLTextAreaElement | HTMLDivElement ;

export async function simulateInput(
  message: string
) {
  await inputMessage(message);
  await sendMessage();
}
export async function inputVoiceMessage(
  message: string,
): Promise<void> {

    let microphoneElement = chatbotInterface.getMicrophoneElement();
    if(microphoneElement){
      microphoneElement.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Logic for voice input
    await sendMessageToBackground('speakText', message);
    await new Promise((resolve) => setTimeout(resolve, 500));
    microphoneElement.click();
    }

}

export async function inputMessage(
  message: string
) {
  // reload input field
  let inputField: ChatbotInputElement  | null = chatbotInterface.getInputElement();

  if (!inputField) {
    console.error('Input field not found.');
    return;
  }
  // if inputFields is not DIV, INPUT or TEXTAREA, find nested input
  if (
    inputField?.tagName !== 'DIV' &&
    inputField?.tagName !== 'INPUT' && 
    inputField?.tagName !== 'TEXTAREA'
  ) {
    inputField = inputField.querySelector(
      'input[type="text"], input:not([type]), textarea, div[contenteditable="true"]',
    );
  }

  if (inputField?.tagName === 'DIV') {
    if (message != '') {
      inputField.innerHTML = message;
    }
  } else if (inputField?.tagName === 'INPUT' || inputField?.tagName === 'TEXTAREA') {
    if (message != '') {
      (inputField as HTMLInputElement | HTMLTextAreaElement).value = message;
    }
  } else {
    console.error('Input field or rich text editor not found.');
  }
}

export function dispatchEvents(element: HTMLElement) {
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);
  element.focus();

  setTimeout(() => {
    ['keydown', 'keypress', 'keyup'].forEach((eventType) => {
      const keyboardEvent = new KeyboardEvent(eventType, {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
      });
      element.dispatchEvent(keyboardEvent);
    });
  }, 100);
}

export async function sendMessage() {
  let inputField: HTMLElement | null = chatbotInterface.getInputElement();
  
  inputField = chatbotInterface.getInputElement();
  if (!inputField) {
    console.error('Input field not found.');
    return;
  }
  // if inputField is not DIV content editable, INPUT or TEXTAREA, input should be nested
  if (
    inputField.tagName !== 'DIV' &&
    inputField.tagName !== 'INPUT' &&
    inputField.tagName !== 'TEXTAREA'
  ) {
    inputField = inputField.querySelector(
      'input[type="text"], input:not([type]), textarea, div[contenteditable="true"]',
    );
  }

  const textEditor = inputField as HTMLInputElement | HTMLTextAreaElement | HTMLDivElement;

  if (textEditor.tagName === 'DIV') {
    textEditor.focus();
    dispatchEvents(textEditor);
  } else if (textEditor.tagName === 'INPUT' || textEditor.tagName === 'TEXTAREA') {
    textEditor.focus();

    dispatchEvents(textEditor);
  } else {
    console.error('Input field or rich text editor not found.');
  }
}