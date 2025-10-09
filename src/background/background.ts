interface TabState{
  url:string;
  isActive:boolean;
}

// <tabId, TabState>
const tabStates:Record<string,TabState> = {};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  //delete previous storage
  chrome.storage.local.clear();
  chrome.runtime.openOptionsPage();
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});


chrome.action.onClicked.addListener((tab) => {
  // if scripts are not injected in content, inject it
chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: () => !!(window as any).__qwContentLoaded
  }).then((results) => {
    const alreadyLoaded = results[0].result;
    if (!alreadyLoaded) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: [
          'dist/qwPage.js',
          'dist/util.js',
          'dist/locales/en.js',
          'dist/act.js',
          'dist/cui.js',
          'dist/content.bundle.js',
          'dist/wcag.js'
        ]
      });
    } else {
      console.log("Content scripts already loaded, skipping injection.");
    }
  });

  chrome.storage.local.get('qualweb_settings', (result) => {
    const settings = result.qualweb_settings;
    if (settings) {
      if (tab.id) {
        // check if options are set

        // if options are set, it is not the first time the extension is opened, open the sidebar
        chrome.sidePanel.setOptions({
          tabId: tab.id!,
          path: 'src/sidebar/sidebar.html',
          enabled: true,
        });

        chrome.sidePanel.open({ tabId: tab.id! });
        tabStates[tab.id!] = { url: tab.url!, isActive: true };
      } else {
        console.error('Tab ID not found.');
      }
    } else {
      // if options are not set, open the options page
      chrome.runtime.openOptionsPage();
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status === 'complete' && tab.url) {
    if(tabStates[tabId]){
      if(tabStates[tabId].url !== tab.url){

         chrome.sidePanel.setOptions({
            tabId: tabId,
            enabled: false
        });
        tabStates[tabId].isActive = false;
      }
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'speakText') {
    chrome.tts.speak(request.text, {
      lang: 'en-US',
      pitch: 0.5,
      volume: 1.0,

      onEvent: (event) => {
        if (event.type == 'end') {
          sendResponse('Speech complete');
        }
      },
    });

    return true;
  }
});


async function getActiveTab(){
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  return activeTab.id;
}