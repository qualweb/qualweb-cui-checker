async function sendActionToActiveTab(action, payload = {}) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action, ...payload }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            chrome.runtime.sendMessage({
              type: 'restartContentScript',
              tab: tabs[0].id,
            });

            return reject(chrome.runtime.lastError);
          }
          resolve(response);
        });
      } else {
        reject(new Error('No active tab found'));
      }
    });
  });
}
async function startDetectingChatbot() {
  return sendActionToActiveTab('detectChatbot');
}

async function startPageChatbotProcedure() {
  return sendActionToActiveTab('pageChatbotProcedure');
}

async function startIdentifySelectorsChatbot() {
  return sendActionToActiveTab('identifySelectors');
}

async function startDetectingChatbotPage() {
  return sendActionToActiveTab('requestElementLLMPage');
}

async function startCorrectionChatbot(elementName) {
  return sendActionToActiveTab('correctElementSelection', {
    element: elementName,
  });
}

async function startVerificationElement(elementName) {
  return sendActionToActiveTab('startVerification', { element: elementName });
}

async function endVerificationElement(elementName) {
  return sendActionToActiveTab('endSucessfulVerification', {
    element: elementName,
  });
}

async function setStoredChatbotSelectors(elementName) {
  return sendActionToActiveTab('setStoredSelectors', { element: elementName });
}
