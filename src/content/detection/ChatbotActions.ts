import { interruptSignalHandlerWithError } from '../../core/interrupter/signalUtil';
import * as Error from '../../errors/content/errors.class.content';
import { sendMessageToBackground } from '../content';
import ChatbotElements from './ChatbotElements';

class ChatbotActions {
  private readonly chatbotElements: ChatbotElements;

  constructor(chatbotElements: ChatbotElements) {
    this.chatbotElements = chatbotElements;
  }

  async simulateInput(message: string, signal: AbortSignal): Promise<void> {
    interruptSignalHandlerWithError(signal);
    await this.insertMessageIntoInput(message);
    await this.sendCurrentInputMessage();
  }
  async inputVoiceMessage(message: string): Promise<void> {
    const microphoneElement = this.chatbotElements.getMicrophoneElement();
    if (!microphoneElement) {
      throw new Error.MicrophoneNotFoundError('Microphone element not found');
    }

    microphoneElement.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await sendMessageToBackground('speakText', message).catch((error) => {
      throw new Error.VoiceInputFailedError(`Failed to send voice message: ${error.message}`);
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    microphoneElement.click();
  }
  getTextFromInputField(): string {
    const inputField = this.chatbotElements.getInputElement();
    return (inputField as HTMLInputElement | HTMLTextAreaElement).value || inputField.innerText;
  }
  toggleMicrophone(): void {
    const microphoneElement = this.chatbotElements.getMicrophoneElement();
    if (!microphoneElement) {
      throw new Error.MicrophoneNotFoundError('Microphone element not found');
    }
    microphoneElement.click();
  }

  async insertMessageIntoInput(message: string): Promise<void> {
    console.log('Inserting message into input:', message);
    if (!message) {
      throw new Error.MessageInsertionError('Message for input cannot be empty');
    }

    const inputField = this.chatbotElements.getInputElement();

    const { tagName } = inputField;

    if (tagName === 'DIV') {
      (inputField as HTMLDivElement).innerHTML = message;
    } else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      (inputField as HTMLInputElement | HTMLTextAreaElement).value = message;
    } else {
      throw new Error.InputNotFoundError(`Unsupported input element: ${tagName}`);
    }
  }

  async sendCurrentInputMessage(): Promise<void> {
    let inputField: HTMLElement;
    console.log('Sending current input message');
    try {
      inputField = this.chatbotElements.getInputElement();
    } catch {
      await new Promise((r) => setTimeout(r, 100));
      inputField = this.chatbotElements.getInputElement();
    }
    const inputEvent = new Event('input', { bubbles: true });
    inputField.dispatchEvent(inputEvent);
    inputField.focus();

    const sendKeyboardEvents = () => {
      ['keydown', 'keypress', 'keyup'].forEach((eventType) => {
        const keyboardEvent = new KeyboardEvent(eventType, {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
        });
        inputField.dispatchEvent(keyboardEvent);
      });
    };

    await new Promise((resolve) =>
      setTimeout(() => {
        sendKeyboardEvents();
        resolve(undefined);
      }, 100),
    );
  }

  public clearInputFieldOrDiv(): void {
    const inputField = this.chatbotElements.getInputElement();

    if (inputField instanceof HTMLInputElement || inputField instanceof HTMLTextAreaElement) {
      inputField.value = '';
    } else {
      inputField.innerText = '';
    }
  }

  public getChabotElements(): ChatbotElements {
    return this.chatbotElements;
  }
}

export default ChatbotActions;
