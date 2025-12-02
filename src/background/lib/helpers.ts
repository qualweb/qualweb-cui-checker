const RESTRICTED_SCHEMES = ['chrome:', 'about:', 'data:', 'file:', 'chrome-extension:'];

export function isRestrictedUrl(url:string):boolean {
  // Check if the URL starts with a restricted scheme
  return RESTRICTED_SCHEMES.some(scheme => url.startsWith(scheme));
}

export function getHostname(url: string): string  {
  try {
    const urlObject = new URL(url);
    
    return urlObject.hostname; 

  } catch (e) {
    throw new Error("Invalid URL");
  }
}


export async function isContentScriptsLoaded(tabId:number): Promise<boolean> {
  if (!tabId) {
    console.log("Tab ID not found for script check.");
    return false;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => !!(window as any).__qwContentLoaded,
    });

    return results[0]?.result || false;
  } catch (error) {
    console.log('Error checking if content scripts are loaded:', error);
    return false;
  }
}

export async function injectScriptsIfAbsent(tabId:number): Promise<boolean> {
  if (!tabId) {
    console.log("Tab ID not found for script injection.");
    return false;
  }

  try {
    const alreadyLoaded = await isContentScriptsLoaded(tabId);

    if (!alreadyLoaded) {
      console.log('Scripts not loaded, injecting now...');
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [
          `./${APP_CONFIG.SCRIPTS_FOLDER}/qwPage.js`,
          `./${APP_CONFIG.SCRIPTS_FOLDER}/util.js`,
          `./${APP_CONFIG.SCRIPTS_FOLDER}/act.js`,
          `./${APP_CONFIG.SCRIPTS_FOLDER}/cui.js`,
          `./${APP_CONFIG.DIST_FOLDER}/content.bundle.js`,
          `./${APP_CONFIG.SCRIPTS_FOLDER}/wcag.js`,
        ],
        injectImmediately: true,
      });
      console.log('Scripts injected successfully.');
      return true;
    } 
  } catch (error) {
    console.log('Error checking/injecting scripts:', error);
    return false;
  }
  return false;
}

