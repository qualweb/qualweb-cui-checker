

async function startVoiceInput(messages) {
  return sendActionToActiveTab("startVoiceInput", messages);
}

async function startLLMInteraction(messages) {
    let settingsStorage = await getQualWebSettings();
  return sendActionToActiveTab("startLLMInteraction",{settings: settingsStorage.options});

}
