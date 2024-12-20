
declare global {
  
  class ACTRules {
    constructor(options: { translate: any, fallback: any });
    configure(options: { rules?: string[], exclude?: string[] }): void;
    executeAtomicRules(): void;
    executeCompositeRules(): void;
    getReport(): ACTReport;
  }

  class WCAGTechniques {
    constructor(locale: any, options?: any);
    execute(newTabWasOpen: boolean, validation?: any): any;
    configure(options: { techniques?: string[], exclude?: string[] }): void;
  }

  class BestPractices {
    constructor(locale: Translate, options?: BPOptions);
    configure(options: BPOptions): void;
    resetConfiguration(): void;
    execute(): BestPracticesReport;
  }

  class CUIChecks  {
    constructor(locale: Translate, options?: CUIOptions)
    configure(options: CUIOptions): void;
    resetConfiguration(): void;
    getReport(): CUIChecksReport;
  }

  interface Window {
    wcag: WCAGTechniques;
    act: ACTRules;
    bp: BestPractices;
    cui: CUIChecks;
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