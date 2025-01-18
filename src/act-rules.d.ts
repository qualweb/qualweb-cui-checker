declare global {
  class CUIChecksRunner {
    constructor(
      moduleOptions: ModuleOptions,
      translationOptions: { translate: any; fallback: any }
    );
    test(data: TestingData): any;
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
    test(data: TestingData): any;
    testSpecial(): any;
    getReport(): ACTReport;
  }

  class WCAGTechniquesRunner {
    constructor(locale: any, options?: any);
    configure(options: { techniques?: string[]; exclude?: string[] }): void;
    test(data: TestingData): any;
    getReport(): any;
  }

  interface Window {
    wcag: WCAGTechniquesRunner;
    act: ACTRulesRunner;
    cui: CUIChecksRunner;
    webkitAudioContext: typeof AudioContext;
  }
}
interface CUIChecksReport {
  assertions: Record<string, CUIRule>;
  metadata: {
    passed: number;
    warning: number;
    failed: number;
    inapplicable: number;
  };
}
interface ACTReport {
  assertions: Record<string, ACTRule>; // Specify the type of assertions
  metadata: {
    passed: number;
    failed: number;
    warning: number;
    inapplicable: number;
  };
}

export {};
