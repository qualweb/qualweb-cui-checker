export interface ChatResponse {
  message: string;
  response: string[];
}

export interface ElementSelector {
  startSelection: () => void;
  resetSelection: () => void;
}

// @Deprecated
export interface LLMResponse {
  xpath_chatbot: string | null;
  xpath_microphone: string | null;
}

// Interface for the response from the local LLM
export interface LocalLLMResponse {
  xpath_window: string | null;
  xpath_input: string | null;
  xpath_conversation: string | null;
  xpath_bot_selector: string | null;
  xpath_microphone: string | null;
}

// Interface for the ChatBot ELements and selector
export interface ChatBotInterface {
  windowElement: HTMLElement | null;
  inputElement: HTMLElement | HTMLInputElement | HTMLTextAreaElement | null;
  messagesSelector: string;
  dialogElement: HTMLElement | null;
  microphoneElement: HTMLElement | null;
  selectors: ChatbotSelector;
}

// Selectors for the chatbot elements
// first index in each array is the current selector for the chatbot element
// more selectors are added when the makes new requests for the chatbot elements, saving possible correct selectors
export interface ChatbotSelector {
  window: string[];
  dialog: string[];
  messages: string[];
  input: string[];
  microphone: string[];
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
  "success-criteria": SuccessCriteria[];
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

interface Result{
  attributes: string[];
  description: string;
  mapping: string;
  elements:   [];
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

export { Summary, Rule, RuleMetadata, Report , Result ,ElementTest};