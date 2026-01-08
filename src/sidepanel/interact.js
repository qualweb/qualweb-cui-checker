async function startLLMInteraction(tabId,selectors,isSpeechTestsEnabled) {
  let settingsStorage = await getQualWebSettings();
  console.log('Starting LLM Interaction with settings:', settingsStorage.options);
  return sendActionToBackground('START_LLM_INTERACTION', {
    settings: settingsStorage.options,
    tabId: tabId,
    selectors: selectors,
    cuiSpeechTests: isSpeechTestsEnabled,
  });
}

async function startLLMSoundInteraction(tabId,selectors,isSpeechTestsEnabled) {
  let settingsStorage = await getQualWebSettings();
  return sendActionToBackground('START_LLM_SOUND_INTERACTION', {
    settings: settingsStorage.options,
    tabId: tabId,
    selectors: selectors,
    cuiSpeechTests: isSpeechTestsEnabled,
  });
}

function skipObjectiveInteraction(tabId) {
  return sendActionToBackground('SKIP_OBJECTIVE_INTERACTION', {
    tabId: tabId,
  });
}

async function cancelInteraction(tabId) {
  return sendActionToBackground('CANCEL_INTERACTION', {
    tabId: tabId,
  });
}

async function prepareCommunicationBackground() {
  const port = chrome.runtime.connect({ name: 'sidebar-port' });
  return port;
}
