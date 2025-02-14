async function startEvaluation() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startEvaluation" },
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

async function startEvaluation() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "startEvaluation" },
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

async function getRoute() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.runtime.sendMessage(
          {
            action: "getRoute",
            tabId: activeTab,
          },
          (response) => {
            if (response.route) {
              resolve(response.route);
            }
          }
        );
      });
    });
  });
}

async function evaluateACT() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "evaluateACT" },
        (response) => {
          resolve(response);
        }
      );
    });
  });
}

async function evaluateWCAG() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "evaluateWCAG" },
        (response) => {
          resolve(response);
        }
      );
    });
  });
}

async function evaluateCUI() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "evaluateCUI" },
        (response) => {
          resolve(response);
        }
      );
    });
  });
}

function endingEvaluation() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "endingEvaluation" },
        (response) => {
          resolve(response);
        }
      );
    });
  });
}

async function getUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
}

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
