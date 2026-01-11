import { HANDLER_ACTIONS } from '../../common/handlers-actions';
import { TabNotActiveError } from '../../errors/background/errors.class.background';
import {
  sendMessageToTab,
  tryScriptReinjectionAndRetryResponse,
} from '../../messaging/message-helpers';
import { processErrorEventCallbackBackground } from '../../errors/background/error.handler.background';

export interface IChromeRequest {
  sendResponse: (response: any) => void;
  request: any;
}

console.log('Background contentProxy initialized.');

if (!chrome.runtime.onMessage.hasListener(handleBackgroundActions)) {
  chrome.runtime.onMessage.addListener(handleBackgroundActions);
}

const HANDLER_BACKGROUND_ACTIONS = {
  CLOSE_TAB_REQUEST: 'CLOSE_TAB_REQUEST',
  REINJECT_SCRIPTS: 'REINJECT_SCRIPTS',
  SIDEPANEL_ALIVE_CHECK: 'SIDEPANEL_ALIVE_CHECK',
  URL_UPDATE_DETECTED: 'URL_UPDATE_DETECTED',
  SPEAK_TEST: 'speakText',
} as const;

function handleMessagesBackground(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
): boolean {
  if (request.action === 'CLOSE_TAB_REQUEST') {
    const tabId = request.tabId;
    if (tabId !== undefined) {
      chrome.sidePanel.setOptions({
        tabId: tabId,
        enabled: false,
      });
      return false;
    }
  } else if (request.action === 'OPEN_TAB_REQUEST') {
    chrome.sidePanel.setOptions({
      tabId: request.data.tabId,
      enabled: true,
    });
    return false;
  } else if (request.action === 'REINJECT_SCRIPTS') {
    const tabId = request.tabId;
    return false;
  } else if (request.action === 'SIDEPANEL_ALIVE_CHECK') {
    // Send response back to side panel
    sendResponse({ status: 'alive' });
  } else if (request.action === 'URL_UPDATE_DETECTED') {
    // Ignore messages originating from the background script itself
    return false;
  } else if (request.action === 'speakText') {
    let locale = request.locale || 'en-US';
    chrome.tts.speak(request.text, {
      lang: locale,
      pitch: 0.5,
      volume: 1,

      onEvent: (event) => {
        if (event.type == 'end') {
          sendResponse('Speech complete');
        }
      },
    });

    return true;
  }
  return false;
}

function handleBackgroundActions(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
): boolean {
  const actionName = request.action;

  if (HANDLER_BACKGROUND_ACTIONS[actionName as keyof typeof HANDLER_BACKGROUND_ACTIONS]) {
    return handleMessagesBackground(request, sender, sendResponse);
  } else if (HANDLER_ACTIONS[actionName as keyof typeof HANDLER_ACTIONS]) {
    return handleProxyActions(request, sender, sendResponse);
  } else {
    console.warn(`[Background Proxy] Action "${actionName}" não possui configuração registada.`);
    return false;
  }
}

function handleProxyActions(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
): boolean {
  const actionName = request.action;
  const actionConfig = HANDLER_ACTIONS[actionName as keyof typeof HANDLER_ACTIONS];

  console.log(`[Background Proxy] Iniciando action: ${actionName}`);

  if (!actionConfig) {
    console.warn(`[Background Proxy] Action "${actionName}" não possui configuração registada.`);
    return false;
  }

  try {
    const tabId = request.tabId || sender.tab?.id;

    if (!tabId) {
      throw new TabNotActiveError('Não foi possível identificar o ID da tab destino.');
    }

    sendMessageToTab(tabId, request, { sendResponse }, tryScriptReinjectionAndRetryResponse);

    console.log(`[Background Proxy] Action ${actionName} processada. Canal aberto`);
    return true;
  } catch (error) {
    console.error(`[Background Proxy] Erro síncrono em ${actionName}:`, error);

    processErrorEventCallbackBackground(error as Error, { sendResponse });

    return false;
  }
}
