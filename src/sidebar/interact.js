
async function typeMessages(messages) {
  console.log("typeMessages", messages);
  return new Promise((resolve, reject) => {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "typeMessages", messages },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
          } else {
            resolve(response);
            console.log(response?.status);
          }
        }
      );
    }
  });
  });
}

async function startVoiceInput(messages) {

return new Promise((resolve, reject) => {
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];
  if (activeTab?.id) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "startVoiceInput", messages },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
          
        } else {
          resolve(response);
          console.log(response?.status);
        }
      }
    );
  }
});
});
}