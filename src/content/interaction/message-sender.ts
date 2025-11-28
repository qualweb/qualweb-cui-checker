import { sendMessageToBackground } from '../content';
import InterfaceChatbot from '../detection/InterfaceChatbot';


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

    let microphoneElement = InterfaceChatbot.getInstance().getMicrophoneElement();
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
  let inputField: ChatbotInputElement | null  = InterfaceChatbot.getInstance().getInputElement();
  console.log("Inputing message to field:", inputField, "Message:", message);
  if (!inputField) {
    console.error('Input field not found.');
    return;
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
  const inputField: HTMLElement | null = InterfaceChatbot.getInstance().getInputElement();

  if (!inputField) {
    console.error('Input field not found.');
    return;
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