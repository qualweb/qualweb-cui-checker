export interface ChatResponse {
  message: string;
  response: string[];
}

export interface ElementSelector {
  startSelection: () => void;
  resetSelection: () => void;
}

export interface LLMResponse {
  xpath_chatbot: string | null;
  xpath_microphone: string | null;
}

export interface LocalLLMResponse {
  xpath_window: string | null;
  xpath_input: string | null;
  xpath_conversation: string | null;
  xpath_bot_selector: string | null;
  xpath_microphone: string | null;
}

export interface ChatBotInterface  {
  windowElement: HTMLElement | null;
  inputElement: HTMLElement | HTMLInputElement | HTMLTextAreaElement | null;
  messagesSelector: string ;
  historyElement: HTMLElement | null;
  microphoneElement: HTMLElement | null;
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
  results: any[];
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

export { Summary, Rule, RuleMetadata, Report };