
import InteractionWorkflow from "../interaction/InteractionWorkflow";
import ChatbotActions from "../detection/ChatbotActions";
import * as ErrorClass from '../../errors/content/errors.class.content'; 


export class InteractionWorkflowFactory {
  private static _instance: InteractionWorkflow | null = null;

  private constructor() {} 

  public static async init(chatbotActions:ChatbotActions,initialMsg: HTMLElement[], isVoiceInteraction: boolean, backgroundPort: chrome.runtime.Port): Promise<void> {
    if (this._instance) {
      await this.destroy();
    }

    this._instance = new InteractionWorkflow(chatbotActions);
    this._instance.config( initialMsg, isVoiceInteraction, backgroundPort);
  }
  public static getInstance(): InteractionWorkflow {
    if (!this._instance) {
      throw new  ErrorClass.InstanceNotInitializedError("InteractionWorkflow was not initialized.");
    }
    return this._instance;
  }
  public static async destroy(): Promise<void> {
    try {
    await this._instance?.destroy();
    this._instance = null;
    } catch {
      // ignore abort errors from aborting interaction workflow
    }
    

  }
}