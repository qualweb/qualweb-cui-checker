setInterval(() => {
  chrome.runtime.sendMessage({ action: 'SIDEPANEL_ALIVE_CHECK' });
}, 10000);

async function sendActionToBackground(action, payload = {}) {
  return new Promise((resolve, reject) => {
    // Primeiro obtemos o tab ativo
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return reject(chrome.runtime.lastError);
      }

      const activeTab = tabs[0];
      if (!activeTab || activeTab.id === undefined) {
        return reject(new Error('Nenhuma tab ativa encontrada'));
      }

      chrome.runtime.sendMessage({ action, tabId: activeTab.id, ...payload }, (response) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }
        if (response?.status === 'error') {
          return reject(new Error(response.message));
        }
        resolve(response);
      });
    });
  });
}


async function cancelDetectionRequest(tabId) {
  return sendActionToBackground('CANCEL_DETECTION', { tabId: tabId });
}

async function startPageChatbotProcedure(tabId) {
  const settings = await getQualWebSettings();
  console.log('Locale in startPageChatbotProcedure:', settings.options.locale);
  return sendActionToBackground('PAGE_CHATBOT_PROCEDURE', { tabId: tabId, locale: settings.options.locale });
}


async function startCorrectionChatbot(elementName, tabId) {
    const settings = await getQualWebSettings();
  console.log('Locale in startCorrectionChatbot:', settings.options.locale);
  return sendActionToBackground('CORRECT_ELEMENT_SELECTION', {
    element: elementName,
    tabId: tabId,
    locale: settings.options.locale
  });
}

async function startVerificationElement(elementName, tabId) {
  return sendActionToBackground('START_VERIFICATION', { element: elementName, tabId: tabId });
}

async function endVerificationElement(elementName, tabId) {
  return sendActionToBackground('END_SUCCESSFUL_VERIFICATION', {
    element: elementName,
    tabId: tabId,
  });
}

async function loadStoredChatbotSelectors(selectors, tabId) {
  return sendActionToBackground('SET_STORED_SELECTORS', { selectors: selectors, tabId: tabId });
}

async function resetDataContentScript(tabId) {
  return sendActionToBackground('RESET_DATA', { tabId: tabId });
}

async function manualSelectMic(tabId) {
  return sendActionToBackground('MANUAL_SELECT_MIC', { tabId: tabId });
}

async function cancelManualSelectMic(tabId) {
  return sendActionToBackground('CANCEL_MANUAL_SELECT_MIC', { tabId: tabId });
}
