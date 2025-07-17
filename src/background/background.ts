 
chrome.runtime.onInstalled.addListener( () => {
  console.log("Extension installed");
  //delete previous storage
  chrome.storage.local.clear();
  chrome.runtime.openOptionsPage();
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })


});


chrome.action.onClicked.addListener( (tab) => {
  chrome.storage.local.get("qualweb_settings", (result) => {
    const settings = result.qualweb_settings;
    if (settings) {
  if (tab.id) {
    // check if options are set

      // if options are set, it is not the first time the extension is opened, open the sidebar
      chrome.sidePanel.setOptions({
        tabId: tab.id!,
        path: "src/sidebar/sidebar.html",
        enabled: true,
      });
      
      chrome.sidePanel.open({ tabId: tab.id! }); 
 
   
  } else {
    console.error("Tab ID not found.");
  }
}else {
  // if options are not set, open the options page
  chrome.runtime.openOptionsPage();
  }});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "speakText") {
    chrome.tts.speak(request.text, {
      lang: "en-US",
      pitch: 0.5,
      volume: 1.0,

      onEvent: (event) => {
        if (event.type == "end") {
          sendResponse("Speech complete");
        }
      },
    });


    return true;
  }
});
