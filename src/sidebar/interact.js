async function startLLMInteraction(tabId) {
  let settingsStorage = await getQualWebSettings();
  console.log("Starting LLM Interaction with settings:", settingsStorage.options);  
  return sendActionToBackground('START_LLM_INTERACTION', {
    settings: settingsStorage.options,
    tabId: tabId,
  });
}

async function startLLMSoundInteraction(tabId) {
  let settingsStorage = await getQualWebSettings();
  return sendActionToBackground('START_LLM_SOUND_INTERACTION', {
    settings: settingsStorage.options,
    tabId: tabId,
  });
}


async function prepareCommunicationBackground() {
 const port = chrome.runtime.connect({ name: "sidebar-port" });
  return port;
}
