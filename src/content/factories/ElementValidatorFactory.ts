import ChatbotDetector from '../detection/ChatbotDetector';
import { ElementManualSelector } from '../detection/ElementManualSelector';
import { ElementValidator } from '../detection/ElementValidator';
import { setGreen, unsetAllGreens, unsetGreen } from '../lib/visualHelpers';
import InterfaceChatbot from '../detection/ChatbotElements';
import { hideMessage, showMessage } from '../../utils/helpers';
import * as ErrorClass from '../../errors/content/errors.class.content';

export class ElementValidatorFactory {
  private static _instance: ElementValidator | null = null;

  private constructor() {}

  public static init(detector: ChatbotDetector, chatbotInterface: InterfaceChatbot): void {
    if (this._instance) {
      this.destroy();
    }
    const context = {
      document: chatbotInterface.getOwnerDocument(),
      showMessage: showMessage,
      hideMessage: hideMessage,
    };
    this._instance = new ElementValidator(
      new ElementManualSelector(context),
      { chatbotDetector: detector, chatbotInterface: chatbotInterface },
      { highlight: setGreen, unhighlight: unsetGreen, unhighlightAll: unsetAllGreens },
    );
  }
  public static getInstance(): ElementValidator {
    if (!this._instance) {
      throw new ErrorClass.InstanceNotInitializedError('ElementValidator not initialized.');
    }
    return this._instance;
  }
  public static destroy(): void {
    try {
      this._instance?.destroy();
      this._instance = null;
    } catch {
      // ignore abort errors from aborting validation
    }
  }
}
