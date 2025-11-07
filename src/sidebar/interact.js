async function startLLMInteraction() {
  let settingsStorage = await getQualWebSettings();
  return sendActionToActiveTab('startLLMInteraction', {
    settings: settingsStorage.options,
  });
}

async function startLLMSoundInteraction() {
  let settingsStorage = await getQualWebSettings();
  return sendActionToActiveTab('startLLMSoundInteraction', {
    settings: settingsStorage.options,
  });
}


async function prepareCommunicationBackground() {
 const port = chrome.runtime.connect({ name: "sidebar-port" });
  return port;
}
