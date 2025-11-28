
import {  getHostname, injectScriptsIfAbsent, isRestrictedUrl } from "./lib/helpers";



chrome.runtime.onInstalled.addListener( () => {
  console.log('Qualweb Extension installed');
  //delete previous storage
   chrome.storage.local.clear();
   chrome.runtime.openOptionsPage();
   chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });


});

chrome.runtime.onStartup.addListener(() => {
  console.log('Chrome iniciou - serviço background ativado pela primeira vez após o arranque do navegador');
  chrome.storage.session.clear();

});


// Lifecycle Handlers
export function initLifeCycleHandlers(): void {
  console.log("Background lifeCycleHandlers initialized.");

// Handler for extension installation


// Handler for action button click
if (!chrome.action.onClicked.hasListener(handleActionClick)) {
  chrome.action.onClicked.addListener(handleActionClick);
}

// Handler for tab updates
if (!chrome.runtime.onMessage.hasListener(handleOnMessage)) {
  chrome.runtime.onMessage.addListener(handleOnMessage);
}

if (!chrome.tabs.onUpdated.hasListener(handleTabUpdate)) {
  chrome.tabs.onUpdated.addListener(handleTabUpdate);
}

 
}

function handleActionClick(tab){
  
  console.log("pressed on Click");

  console.log("Passed is SidebarOpen");

  if (!tab.url || isRestrictedUrl(tab.url)) {
    console.error('Cannot open side panel on this URL:', tab.url);
    return;
  }

  console.log("Passed restrictedURL");

  if (!tab.id) {
    console.error("Tab ID not found.");
    return;
  }

  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: `./${APP_CONFIG.DIST_FOLDER == "" ? "" : APP_CONFIG.DIST_FOLDER + "/"}sidebar/sidebar.html`,
    enabled: true,
  });

  chrome.sidePanel.open({ tabId: tab.id }).then( async () => {
      await injectScriptsIfAbsent(tab.id!);

    console.log("Side panel opened for tab:", tab?.id);
  });

}

function handleOnMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): void {
  if (request.action === 'CLOSE_TAB_REQUEST') {
    const tabId = request.tabId;
    if (tabId !== undefined) {
      chrome.sidePanel.setOptions({
        tabId: tabId,
        enabled: false
      });
  }
}else if (request.action === 'REINJECT_SCRIPTS') {
    const tabId = request.tabId;
    
    injectScriptsIfAbsent(tabId).then( (result) => {
    // reload selectors if url changed
            if(result){
            chrome.tabs.sendMessage(tabId, {
              action: 'SET_STORED_SELECTORS',
              tabId: tabId,
              url: request.url
            });
          };

  }).catch( (error) => {
    console.error("Error injecting scripts on tab update for tab:",tabId,error);
  });
    
  }else  if (request.action === 'SIDEPANEL_ALIVE_CHECK') {
      console.log("Received sidepanel alive check from tab:",request.tabId);
    }
} 


function handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
    console.log("ONUpdated ", tabId,changeInfo,tab.url);
    
    if( changeInfo.status === 'loading' ){

      console.log("Tab is loading new URL:",tab.url ," for tab:",tabId,"sending URL update message to sidepanel.");
      const url = changeInfo.url || tab.url ;
      chrome.runtime.sendMessage({
        tabId: tabId,
        action: 'URL_UPDATE_DETECTED',
        url: tab.url
      });
    // if only loading 
    }
  };


