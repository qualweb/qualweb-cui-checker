async function startDetectingChatbot() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "requestElementLLM" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
}

async function startVerificationWindowElement() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startVerifyElementWindow" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
}

async function startVerificationInputElement() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startVerifyElementInput" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
}

async function startVerificationConversationElement() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startVerifyElementConversationWindow" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
}

async function startVerificationChatMessageElements() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startVerifyElementMessages" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
}

async function startVerificationMicElement() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startVerifyElementMicrophone" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
}
