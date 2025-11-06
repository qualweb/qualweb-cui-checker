declare global {

  interface RuleTest{
    code:string;
    selector:string;
    result:string;
  }
  class CUIChecksRunner {
    constructor(
      moduleOptions: any,
      translationOptions: { translate: any; fallback: any },
      filePath?: string,
      rules?:RuleTest[]
    );
    test(data: any): any;
    executeTests(): Promise<any>;
    getReport(): CUIChecksReport;
  }

  interface QWCUI_Selectors {
    QW_CC_WINDOW: string;
    QW_CC_DIALOG: string;
    QW_CC_MESSAGES: string;
    QW_CC_MIC: string;
    QW_CC_INPUT: string;
  }

  class ACTRulesRunner {
    constructor(options: { translate: any; fallback: any });
    configure(options: { rules?: string[]; exclude?: string[] }): void;
    test(data: any): any;
    testSpecial(): any;
    getReport(): ACTReport;
  }

  class WCAGTechniquesRunner {
    constructor(locale: any, options?: any);
    configure(options: { techniques?: string[]; exclude?: string[] }): void;
    test(data: any): any;
    getReport(): any;
  }

  interface Window {
    wcag: WCAGTechniquesRunner;
    act: ACTRulesRunner;
    cui: CUIChecksRunner;
    webkitAudioContext: typeof AudioContext;
  }

interface CUIChecksReport {
  assertions: Record<string, any>;
  metadata: {
    passed: number;
    warning: number;
    failed: number;
    inapplicable: number;
  };
}
interface ACTReport {
  assertions: Record<string, any>; // Specify the type of assertions
  metadata: {
    passed: number;
    failed: number;
    warning: number;
    inapplicable: number;
  };
}
 const APP_CONFIG: {
    VERSION: string;
    DIST_FOLDER: string;
    RESOURCES_WORDS_PT: string;
    INITIAL_INTERACTION_MESSAGE_PT: string;
    INITIAL_INTERACTION_MESSAGE_EN: string;
  };

}

import sinonChrome from 'sinon-chrome';



//mock chrome api
(global as any).APP_CONFIG = {
  VERSION: '1.0.0',
  DIST_FOLDER: 'dist',
  RESOURCES_WORDS_PT: 'resources/words_pt.json',
  INITIAL_INTERACTION_MESSAGE_PT: 'Olá! Como posso ajudar?',
  INITIAL_INTERACTION_MESSAGE_EN: 'Hello! How can I help you?',
};
(global as any).chrome = sinonChrome;
//mock window dom
(global as any).window = {};


export {};
