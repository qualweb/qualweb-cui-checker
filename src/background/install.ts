

chrome.runtime.onInstalled.addListener(() => {
  console.log('Qualweb Extension installed');
  //delete previous storage
  chrome.storage.local.clear();
  chrome.runtime.openOptionsPage();
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

});