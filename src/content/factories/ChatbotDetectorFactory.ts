import * as ErrorClass from '../../errors/content/errors.class.content';
import ChatbotDetector from '../detection/ChatbotDetector';
import InterfaceChatbot from '../detection/ChatbotElements';

export class ChatbotDetectorFactory {
  private static _instance: ChatbotDetector | null = null;
  private constructor() {}

  public static init(chatbotInterface: InterfaceChatbot): ChatbotDetector {
    this.destroy();

    this._instance = new ChatbotDetector(chatbotInterface);

    return this._instance;
  }

  public static getInstance(): ChatbotDetector {
    if (!this._instance) {
      throw new ErrorClass.InstanceNotInitializedError('ChatbotDetector not initialized.');
    }
    return this._instance;
  }

  public static destroy(): void {
    try {
      this._instance?.cancelDetection();
      this._instance = null;
    } catch {
      // ignore abort errors from aborting detection
    }
  }
}
