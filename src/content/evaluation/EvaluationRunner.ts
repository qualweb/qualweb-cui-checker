import { locale_en } from '../../locales/en';
import { filterResults } from '../../utils/evaluationHelpers';
import { ChatBotSelectors, Summary,Report } from '../../utils/types';
import InterfaceChatbot from '../detection/ChatbotElements';
import * as ErrorClass from '../../errors/content/errors.class.content'; 

interface QWCUI_Selectors {
  [key: string]: string;
}

interface QWCUI_Settings {
  [key: string]: string;
}

export class EvaluationRunner {
  private summary: Summary;
  private chatbotSummary: Summary;
  public rulesTested: RuleTest[] = [];
  private QWCUI_Selectors: QWCUI_Selectors = {};
  private readonly urlCommonWords: string;
  private readonly interfaceChatbot: InterfaceChatbot;

  public constructor(interfaceChatbot: InterfaceChatbot,urlCommonWords: string) {
    this.interfaceChatbot = interfaceChatbot;
    this.urlCommonWords = urlCommonWords;

    this.summary = this.createEmptySummary();
    this.chatbotSummary = this.createEmptySummary();
  }


  private createEmptySummary(): Summary {
    return {
      passed: 0,
      failed: 0,
      warning: 0,
      inapplicable: 0,
      title: document.title,
    };
  }

  startEvaluation() {
    this.summary = this.createEmptySummary();
    if (this.interfaceChatbot.getWindowElement()) {
      this.chatbotSummary = this.createEmptySummary();
    }
    return [this.summary, this.chatbotSummary];
  }

  endEvaluation() {
    return [this.summary, this.chatbotSummary];
  }

  startEvaluationACT() {
    console.log('Evaluating ACT');
    const excludedRules = [
      'QW-ACT-R1',
      'QW-ACT-R2',
      'QW-ACT-R3',
      'QW-ACT-R4',
      'QW-ACT-R5',
      'QW-ACT-R6',
      'QW-ACT-R7',
      'QW-ACT-R8',
    ];
    const actResult = this.executeEvalACT();

    this.addValuesToSummary(actResult);
    return this.filterResults(actResult);
  }

  startEvaluationWCAG() {
    const excludedTechniques = [
      'QW-WCAG-T14',
      'QW-WCAG-T15',
      'QW-WCAG-T16',
      'QW-WCAG-T17',
      'QW-WCAG-T18',
      'QW-WCAG-T19',
      'QW-WCAG-T20',
      'QW-WCAG-T21',
      'QW-WCAG-T22',
    ];

    const htmlResult = this.executeEvalWCAG();
    this.addValuesToSummary(htmlResult);

    return this.filterResults(htmlResult);
  }
  private executeEvalWCAG() {
    const sourceHtml = document.documentElement.outerHTML;
    try{
    window.wcag = new WCAGTechniquesRunner({ translate: locale_en, fallback: locale_en });
    window.wcag.test({ sourceHtml });
    const report = window.wcag.getReport();
    return report;
    } catch{
      throw new ErrorClass.WCAGEvaluationError('Error executing WCAG Techniques evaluation.');
    }
  }

  private executeEvalACT() {
    try{
    const sourceHtml = document.documentElement.outerHTML;
    console.log('Source HTML length for ACT evaluation:', sourceHtml.length);
    window.act = new ACTRulesRunner({ translate: locale_en, fallback: locale_en });
    window.act.test({ sourceHtml });
    const report = window.act.getReport();
    return report;
    } catch{
      throw new ErrorClass.ACTEvaluationError('Error executing ACT Rules evaluation.');
    }
  }

  async startEvaluationCUI(qualweb_settings: QWCUI_Settings) {
    try {
    const settingsQualweb: QWCUI_Settings = { locale: qualweb_settings.locale };
    const selectors: ChatBotSelectors = this.interfaceChatbot.getSelectors();

    this.QWCUI_Selectors['QW_CC_WINDOW'] = selectors.windowSelector;
    this.QWCUI_Selectors['QW_CC_DIALOG'] = selectors.dialogSelector;
    this.QWCUI_Selectors['QW_CC_MESSAGES'] = selectors.messagesSelector;
    this.QWCUI_Selectors['QW_CC_INPUT'] = selectors.inputSelector;
    if (selectors.microphoneSelector) {
      this.QWCUI_Selectors['QW_CC_MIC'] = selectors.microphoneSelector;
    }
    const cuiResult = await this.executeEvalCui(settingsQualweb);

    this.addValuesToSummary(cuiResult);

    return this.filterResults(cuiResult);
  } catch {
    throw new ErrorClass.CUIEvaluationError('Error executing CUI evaluation.');
  }
}

  private addValuesToSummary(report: Report) {
    this.summary.passed += report.metadata.passed;
    this.summary.failed += report.metadata.failed;
    this.summary.warning += report.metadata.warning;
    this.summary.inapplicable += report.metadata.inapplicable;
  }
  private addValuesToChatbotSummary(report: Report) {
    this.chatbotSummary.passed += report.metadata.passed;
    this.chatbotSummary.failed += report.metadata.failed;
    this.chatbotSummary.warning += report.metadata.warning;
    this.chatbotSummary.inapplicable += report.metadata.inapplicable;
  }
  private filterResults(results: CUIChecksReport | ACTReport) {
    let result = results.assertions;
    const windowElement = this.interfaceChatbot.getWindowElement();
    let chatbotResult;

    if (windowElement) {
      const chatbotCuiResult = filterResults(results, windowElement);
      this.addValuesToChatbotSummary(chatbotCuiResult);

      chatbotResult = chatbotCuiResult.assertions;
    }
    return [result, chatbotResult];
  }

  private async executeEvalCui(settingsQualweb: QWCUI_Settings) {
    window.cui = new CUIChecksRunner(
      { selectors: this.QWCUI_Selectors, settings: settingsQualweb },
      { translate: 'en', fallback: 'en' },
      this.urlCommonWords,
      this.rulesTested,
    );
    await window.cui.executeTests();
    return window.cui.getReport();
  }

  addRuleTested(ruleTest: RuleTest) {
    this.rulesTested.push(ruleTest);
  }

  addSelectors(selectors: QWCUI_Selectors) {
    Object.keys(selectors).forEach((key) => {
      this.QWCUI_Selectors[key] = selectors[key];
    });
  }

  getSummary() {
    console.log('Getting summary');
    console.log('geral', this.summary);
    console.log('chatbot', this.chatbotSummary);
    return [this.summary, this.chatbotSummary];
  }
  cleanUp() {

    this.rulesTested = [];
    this.QWCUI_Selectors = {};
    this.summary = this.createEmptySummary();
    this.chatbotSummary = this.createEmptySummary();
  }
}
