import { makeChatSectionsDynamic } from "./DynamicChatGenerator";

interface ChatSection {
  text: string;
  attributes: Record<string, string>;
}
type ChatResponse = 'assistant' | 'user' | 'hiddenSection';
interface ChatSectionsInput {
  [key in ChatResponse]?: ChatSection[];
}

const html = makeChatSectionsDynamic({
  assistant: {
    text: "Olá, em que posso ajudar?",
    attributes: {
      "data-visible": "true",
      "aria-label": "Assistente",
    },
  },
  user: {
    text: "Preciso de ajuda com XPATH.",
    attributes: {
      "class": "chat-thread",
      "aria-hidden": "false",
      "custom-attr": "example",
    },
  },
  hiddenSection: {
    text: "Conteúdo oculto para teste",
    attributes: {
      "data-status": "active",
    },
  },
});