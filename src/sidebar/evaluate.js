async function startEvaluation() {
  return sendActionToActiveTab("startEvaluation");
}

async function evaluateACT() {
  return sendActionToActiveTab("evaluateACT");
}

async function evaluateWCAG() {
  return sendActionToActiveTab("evaluateWCAG");
}

async function evaluateCUI() {
  let settingsStorage = await getQualWebSettings();
  console.log("Settings Storage: ", settingsStorage);
  return sendActionToActiveTab("evaluateCUI",{settings: settingsStorage.options});
}

async function endingEvaluation() {
  return sendActionToActiveTab("endingEvaluation");
}
async function getUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
}

async function getQualWebSettings() {

  return new Promise((resolve, reject) => {
    chrome.storage.local.get("qualweb_settings", (result) => {
      resolve(result.qualweb_settings);
    });
  });
}
