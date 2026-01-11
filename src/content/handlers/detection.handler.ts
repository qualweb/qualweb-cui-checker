import { hideMessage, showMessage } from '../../utils/helpers';
import { ChatBotSelectors } from '../../utils/types';
import * as Error from '../../errors/content/errors.class.content';
import { SUCCESS_MESSAGES_CONTENT } from '../messages';
import { IChromeRequest, sendResponse } from '.';
import { ChatbotDetectorFactory } from '../factories/ChatbotDetectorFactory';
import { ChatbotElementsFactory } from '../factories/ChatbotElementsFactory';
import { ElementValidatorFactory } from '../factories/ElementValidatorFactory';

const languageTextMapper: Record<string, string> = {
  'en-US': APP_CONFIG.INITIAL_INTERACTION_MESSAGE_EN,
  'pt-PT': APP_CONFIG.INITIAL_INTERACTION_MESSAGE_PT,
};

let currentAbortController: AbortController | null = null;

export async function startPageChatbotProcedure(data: IChromeRequest): Promise<void> {
  console.log('Starting chatbot detection procedure');
  currentAbortController = new AbortController();
  const { signal } = currentAbortController;
  try {
    const chatbotInterface = ChatbotElementsFactory.init();
    const ChatbotDetector = ChatbotDetectorFactory.init(chatbotInterface);

    const locale = data.request.locale || 'en-US';
    const userMessage = languageTextMapper[locale] || languageTextMapper['en-US'];
    const selectors: ChatBotSelectors = await ChatbotDetector.detect(userMessage, signal);

    chatbotInterface.setSelectors(selectors);
    console.log('Chatbot detected with selectors:', selectors);
    console.log('Sending detected selectors back to background script');
    sendResponse(data, {
      ...SUCCESS_MESSAGES_CONTENT.CHATBOT_DETECTED,
      data: { selectors: selectors },
    });
  } catch (error) {
    if (error instanceof Error.IframeNotAccessibleError) {
      showMessage(
        'Some iframes could not be accessed due to cross-origin restrictions, which limits the chatbot detection capabilities in this version.',
        2000,
      );
      return;
    } else if (error instanceof Error.CancellationError) {
      sendResponse(data, SUCCESS_MESSAGES_CONTENT.CANCELLED_DETECTION);
      showMessage('Chatbot detection cancelled', 2000);
      return;
    }
    throw error;
  } finally {
    currentAbortController?.abort();
    currentAbortController = null;
    ChatbotDetectorFactory.destroy();
  }
}

export function actionStartVerification(data: IChromeRequest) {
  try {
    const chatbotInterface = ChatbotElementsFactory.init();
    if (!data.request.selectors)
      throw new Error.InvalidSelectorProvidedError(
        'No selectors provided for starting verification',
      );
    chatbotInterface.setSelectors(data.request.selectors);
    ChatbotDetectorFactory.init(chatbotInterface);
    const chatbotDetector = ChatbotDetectorFactory.getInstance();

    console.log('Verifying element for:', data.request.element);

    ElementValidatorFactory.init(chatbotDetector, chatbotInterface);

    const instance = ElementValidatorFactory.getInstance();

    let selectorKey = data.request.element;
    if (selectorKey === undefined || selectorKey === null || selectorKey.trim() === '') {
      throw new Error.InvalidSelectorProvidedError(
        'No selector key provided for starting verification',
      );
    }

    instance.startConfirmation(selectorKey);

    sendResponse(data, SUCCESS_MESSAGES_CONTENT.ELEMENT_VERIFICATION_STARTED);
  } catch (error) {
    console.log('Error during element verification start:', error);
    throw error;
  } finally {
    ElementValidatorFactory.destroy();
    ChatbotDetectorFactory.destroy();
    ChatbotElementsFactory.destroy();
  }
}

export function actionEndSuccessfulVerification(data: IChromeRequest) {
  console.log('Ending successful verification of element');
  try {
    const chatbotInterface = ChatbotElementsFactory.init();
    chatbotInterface.setSelectors(data.request.selectors);
    ChatbotDetectorFactory.init(chatbotInterface);
    const chatbotDetector = ChatbotDetectorFactory.getInstance();
    console.log('Verifying element for:', data.request.element);

    ElementValidatorFactory.init(chatbotDetector, chatbotInterface);

    const instance = ElementValidatorFactory.getInstance();
    let selectorKey = data.request.element;
    if (selectorKey === undefined || selectorKey === null || selectorKey.trim() === '') {
      throw new Error.InvalidSelectorProvidedError(
        'No selector key provided for ending verification',
      );
    }

    instance.endConfirmation(selectorKey);
    sendResponse(data, SUCCESS_MESSAGES_CONTENT.ELEMENT_VERIFICATION_ENDED);
  } catch (error) {
    console.log('Error during ending element verification:', error);
    throw error;
  } finally {
    ElementValidatorFactory.destroy();
    ChatbotDetectorFactory.destroy();
    ChatbotElementsFactory.destroy();
  }
}

export function cancelDetection(data: IChromeRequest) {
  currentAbortController?.abort();

  sendResponse(data, SUCCESS_MESSAGES_CONTENT.CANCELLED_DETECTION);
}
export async function actionCorrectElementSelection(data: IChromeRequest): Promise<void> {
  currentAbortController = new AbortController();
  const { signal } = currentAbortController;
  console.log('Correcting element selection for:', data.request.element);
  try {
    const chatbotInterface = ChatbotElementsFactory.init();
    chatbotInterface.setSelectors(data.request.selectors);
    const chatbotDetector = ChatbotDetectorFactory.init(chatbotInterface);

    ElementValidatorFactory.init(chatbotDetector, chatbotInterface);

    const instance = ElementValidatorFactory.getInstance();

    console.log('Verifying element for:', data.request.element);

    const locale = data.request.locale || 'en-US';
    if (!locale) throw new Error.LocaleNotFoundError('No locale provided for element correction');
    const userMessage = languageTextMapper[locale] || languageTextMapper['en-US'];
    let response = await instance.correct(data.request.element, userMessage, signal);
    sendResponse(data, {
      ...SUCCESS_MESSAGES_CONTENT.ELEMENT_VERIFICATION_ENDED,
      data: response,
    });
  } catch (error) {
    console.log('Error during correcting element selection:', error);
    throw error;
  } finally {
    ElementValidatorFactory.destroy();
    ChatbotDetectorFactory.destroy();
    ChatbotElementsFactory.destroy();
    currentAbortController = null;
  }
}

export function resetDataContentScript(data: IChromeRequest) {
  console.log('Resetting data in content script');
  try {
    ChatbotDetectorFactory.destroy();
    ChatbotElementsFactory.destroy();
    ElementValidatorFactory.destroy();
  } catch {
    // ignore errors during reset
  }
  sendResponse(data, SUCCESS_MESSAGES_CONTENT.CONTENT_RESET);
}

export async function requestManualSelectionMic(data: IChromeRequest): Promise<void> {
  try {
    const chatbotInterface = ChatbotElementsFactory.init();
    chatbotInterface.setSelectors(data.request.selectors);
    const chatbotDetector = ChatbotDetectorFactory.init(chatbotInterface);

    ElementValidatorFactory.init(chatbotDetector, chatbotInterface);

    const elementValidator = ElementValidatorFactory.getInstance();
    const manualSelector = elementValidator.getElementManualSelector();
    let response = await manualSelector.init();

    let updatedSelectors = ChatbotElementsFactory.getInstance().getSelectors();
    updatedSelectors.microphoneSelector = response.selector;

    ChatbotElementsFactory.getInstance().setSelectors(updatedSelectors);
    sendResponse(data, {
      ...SUCCESS_MESSAGES_CONTENT.MICROPHONE_SELECTED,
      data: updatedSelectors,
    });
  } catch (error) {
    console.log('Error during manual microphone selection:', error);
    throw error;
  } finally {
    ElementValidatorFactory.destroy();
    ChatbotDetectorFactory.destroy();
    ChatbotElementsFactory.destroy();
  }
}

export async function cancelManualDetection(data: IChromeRequest): Promise<void> {
  try {
    const chatbotInterface = ChatbotElementsFactory.init();
    chatbotInterface.setSelectors(data.request.selectors);
    ChatbotDetectorFactory.init(chatbotInterface);
    const chatbotDetector = ChatbotDetectorFactory.getInstance();

    ElementValidatorFactory.init(chatbotDetector, chatbotInterface);
    const instance = ElementValidatorFactory.getInstance().getElementManualSelector();

    instance.cancelSelection();

    sendResponse(data, SUCCESS_MESSAGES_CONTENT.CANCELLED_MANUAL_MIC_SELECTION);
  } catch (error) {
    console.log('Error during cancelling manual microphone selection:', error);
    throw error;
  } finally {
    ElementValidatorFactory.destroy();
    ChatbotDetectorFactory.destroy();
    ChatbotElementsFactory.destroy();
  }
}

export function showMessageContentScript(data: IChromeRequest) {
  const message = data.request.message;
  const duration = data.request.duration || 2000;
  showMessage(message, duration);
  sendResponse(data, SUCCESS_MESSAGES_CONTENT.SHOW_MESSAGE_SUCCESS_NOTIFICATION);
}

export function hideMessageContentScript(data: IChromeRequest) {
  hideMessage();
  sendResponse(data, SUCCESS_MESSAGES_CONTENT.HIDE_MESSAGE_SUCCESS_NOTIFICATION);
}
