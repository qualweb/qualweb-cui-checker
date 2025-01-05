chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
     chrome.sidePanel.setOptions({
      tabId:tab.id!,
      path: 'src/popup/popup.html',
      enabled: true
    });
  } else {
    console.error('Tab ID not found.');
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
                                        sendResponse("Speech complete");

                                      }
                                    }
                                   });

    return true; 
  } 
});


