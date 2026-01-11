import { MessageContent, MessageContentComplex } from '@langchain/core/messages';

export function extractText(content: MessageContent): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter(
        (part): part is Extract<MessageContentComplex, { type: 'text' }> => part.type === 'text',
      )
      .map((part) => part.text)
      .join('');
  }

  return '';
}
