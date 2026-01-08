import * as ErrorClass from '../../errors/content/errors.class.content'; 
import ChatbotElements from "../detection/ChatbotElements";
import { EvaluationRunner } from "../evaluation/EvaluationRunner";



export class EvaluationRunnerFactory {
  private static _instance: EvaluationRunner | null = null;

  private constructor() {} 

  public static init(chatbotInterface: ChatbotElements): void {
   if (this._instance) {
      return;
    }
    const urlCommonWords = chrome.runtime.getURL(
      `${APP_CONFIG.RESOURCES_FOLDER}/${APP_CONFIG.RESOURCES_WORDS_PT}`,
    );

    this._instance = new EvaluationRunner(chatbotInterface, urlCommonWords);
  }
  public static getInstance(): EvaluationRunner {
    if (!this._instance) {
      throw new  ErrorClass.InstanceNotInitializedError("EvaluationRunner not initialized..");
    }
    return this._instance;
  }
  public static destroy(): void {

    this._instance?.cleanUp();
    this._instance = null;
    

  }
}