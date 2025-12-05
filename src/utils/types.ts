export interface ChatResponse {
  message: string;
  response: string[];
}

export interface QWCUI_Settings {
  [key: string]: string;
}

export interface LLM_Settings {
  LLMService: string;
  apiKey: string | null;
  locale: string;
}

export interface ResponsesSelectors {
  [rule: string]: string[];
}

// Selectors for the chatbot elements
// first index in each array is the current selector for the chatbot element
// more selectors are added when the makes new requests for the chatbot elements, saving possible correct selectors
export interface ChatBotSelectors {
  iframeSelector?: string;
  inputSelector: string;
  messagesSelector: string;
  dialogSelector: string;
  microphoneSelector?: string;
  windowSelector: string;
}
export interface ResponseStore {
  [message: string]: string;
}

interface Summary {
  passed: number;
  failed: number;
  warning: number;
  inapplicable: number;
  title: string;
}

interface SuccessCriteria {
  name: string;
  level: string;
  principle: string;
  url: string;
}

interface RuleMetadata {
  target: {
    element: string | string[];
  };
  'success-criteria': SuccessCriteria[];
  related: string[];
  url: string;
  passed: number;
  warning: number;
  failed: number;
  inapplicable: number;
  outcome: string;
  description: string;
}

interface Rule {
  name: string;
  code: string;
  mapping: string;
  description: string;
  metadata: RuleMetadata;
  results: Result[];
}

interface Result {
  attributes: string[];
  description: string;
  mapping: string;
  elements: [];
  resultCode: string;
  veridict: string;
}

interface ElementTest {
  acessibleName: string;
  htmlCode: string;
  pointer: string;
}

interface Report {
  assertions: {
    [rule: string]: Rule;
  };
  metadata: {
    passed: number;
    failed: number;
    warning: number;
    inapplicable: number;
  };
}

export { Summary, Rule, RuleMetadata, Report, Result, ElementTest };
