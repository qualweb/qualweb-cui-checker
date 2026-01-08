
import * as ErrorClass from '../../errors/content/errors.class.content'; 
import ChatbotElements  from '../detection/ChatbotElements';


export class ChatbotElementsFactory {
  private static _instance: ChatbotElements | null = null;
  private constructor() {} 

  public static init(selectors?): ChatbotElements {
     if (this._instance) {
      this.destroy();
    }

      this._instance ??= new ChatbotElements();
      if(selectors) {
        this._instance.setSelectors(selectors);
      }
    
    return this._instance;
  }

 public static getInstance(): ChatbotElements {
     if (!this._instance) {
       throw new  ErrorClass.InstanceNotInitializedError("InterfaceChatbot not initialized.");
     }
     return this._instance;
   }

  public static destroy(): void {
    this._instance = null;
  }
}