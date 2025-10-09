async function startVoiceInput(messages) {
  return sendActionToActiveTab('startVoiceInput', messages);
}

async function startLLMInteraction(messages) {
  let settingsStorage = await getQualWebSettings();
  return sendActionToActiveTab('startLLMInteraction', {
    settings: settingsStorage.options,
  });
}


async function startInteraction() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        const port = chrome.tabs.connect(tabs[0].id, { name: "qw-interaction" });
        resolve(port);
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
};