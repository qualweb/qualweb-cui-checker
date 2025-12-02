import { hideMessage, showMessage } from '../../utils/helpers';
import { findButton, getGroupSelectorRelative } from '../lib/DomTools';
import InterfaceChatbot from './InterfaceChatbot';

class ChatbotManualSelector {
  private static _instance: ChatbotManualSelector;
  private rejectFn: ((reason?: any) => void) | null = null;
  private onClickHandler: ((event: MouseEvent) => void) | null = null;

  private constructor() {}

  public static getInstance() {
    if (!ChatbotManualSelector._instance) {
      ChatbotManualSelector._instance = new ChatbotManualSelector();
    }
    return ChatbotManualSelector._instance;
  }

  async cancelSelectionMic() {
    hideMessage();
    if (this.onClickHandler) {
      const documentOwner = InterfaceChatbot.getInstance().getOwnerDocument();
      documentOwner.removeEventListener('click', this.onClickHandler, true);
      this.onClickHandler = null;
    }

    if (this.rejectFn) {
      this.rejectFn(new Error('Selection cancelled'));
      this.rejectFn = null;
    }
  }

  async requestSelectionMic(): Promise<{ selector: string }> {
    showMessage('Please click on the microphone button');
    const documentOwner = InterfaceChatbot.getInstance().getOwnerDocument();
    return new Promise((resolve, reject) => {
      this.rejectFn = reject;
      this.onClickHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('Target of Click', event.target);
        const button = findButton(event.target as HTMLElement, event.clientX, event.clientY);
        if (button === null) {
          showMessage('The click target is not a valid button');
        } else {
          documentOwner.removeEventListener('click', this.onClickHandler!, true);
          const micSelector = getGroupSelectorRelative(button);

          resolve({ selector: micSelector });
        }
      };

      documentOwner.addEventListener('click', this.onClickHandler, true);
    });
  }
}

export default ChatbotManualSelector;
