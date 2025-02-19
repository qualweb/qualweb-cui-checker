
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

async function startCorrectionChatbot(elementName) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "correctElementSelection", element: elementName },
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

async function startVerificationElement(elementName) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startVerification", element: elementName },
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
async function endVerificationElement(elementName) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "endSucessfulVerification", element: elementName },
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
