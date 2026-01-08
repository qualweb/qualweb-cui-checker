import {   isRestrictedUrl } from '../lib/helpers';

chrome.runtime.onInstalled.addListener((details) => {
  if(details.reason === 'install'){
  console.log('Qualweb Extension installed');
  //delete previous storage
  chrome.storage.local.clear();
  chrome.runtime.openOptionsPage();
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } else if(details.reason === 'update'){
    console.log('Qualweb Extension updated to new version');
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log(
    'Chrome iniciou - serviço background ativado pela primeira vez após o arranque do navegador',
  );
  chrome.storage.session.clear();
});

// Lifecycle Handlers

  console.log('Background lifeCycleHandlers initialized.');

  // Handler for extension installation

  // Handler for action button click
  if (!chrome.action.onClicked.hasListener(handleActionClick)) {
    chrome.action.onClicked.addListener(handleActionClick);
  }

  // Handler for tab updates


  if (!chrome.tabs.onUpdated.hasListener(handleTabUpdate)) {
    chrome.tabs.onUpdated.addListener(handleTabUpdate);
  }
  


function handleActionClick(tab: chrome.tabs.Tab): void {
  let isSettingsSettedAfterInstall = false;
  chrome.storage.local.get(['qualweb_settings'], (result) => {
    console.log('Clicked on action button storage is', result);
    if (result.qualweb_settings){
      isSettingsSettedAfterInstall = true;
    }
  if (!isSettingsSettedAfterInstall){  
    console.log('Settings not setted, opening options page');
    chrome.runtime.openOptionsPage();
    return;
  }

  if (!tab.url || isRestrictedUrl(tab.url)) {
    console.log('Cannot open side panel on this URL:', tab.url);
    return;
  }

  if (!tab.id) {
    console.log('Tab ID not found.');
    return;
  }
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: './sidepanel/sidepanel.html',
    enabled: true,
  });


chrome.sidePanel.open({ tabId: tab.id });
  });
}



function handleTabUpdate(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab,
): void {
  if ( tab.url && !isRestrictedUrl(tab.url))  return;
  
  chrome.sidePanel.getOptions({ tabId: tabId }).then((options) => {
    if (options.enabled) {
      if (changeInfo.status === 'loading') {
        chrome.runtime.sendMessage(
          {
            tabId: tabId,
            action: 'URL_UPDATE_DETECTED',
            url: tab.url,
          }
        );
      }
    }
 
  }).catch((error) => {
    console.log('Error getting side panel options for tab:', tabId, error)  ;
  });

}