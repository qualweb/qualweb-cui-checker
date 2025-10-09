import { chatbotInterface } from '../detection/Detection';
import { setLastMessageUser } from './utils';

export type ChatbotInputElement = HTMLInputElement | HTMLTextAreaElement | HTMLDivElement;

export async function simulateInput(
  message: string,
  inputElement?: ChatbotInputElement,
) {
  await inputMessage(message, inputElement);
  await sendMessage(inputElement);
}

export async function inputMessage(
  message: string,
  inputElement?: ChatbotInputElement,
) {
  setLastMessageUser(message);
  // reload input field
  let inputField: HTMLElement | null = inputElement || null;

  if (!inputElement) {
    let ownerDocument = chatbotInterface!.dialogElement!.ownerDocument;
    inputField = ownerDocument.querySelector<HTMLElement>(chatbotInterface!.selectors.input[0]!);
  }

  // Element exists?
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

export async function sendMessage(
  inputElement?: HTMLInputElement | HTMLTextAreaElement | HTMLDivElement,
) {
  let inputField: HTMLElement | null = inputElement || null;

  if (!inputElement) {
    let ownerDocument = chatbotInterface!.dialogElement!.ownerDocument;
    inputField = ownerDocument.querySelector<HTMLElement>(chatbotInterface!.selectors.input[0]);
  }

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