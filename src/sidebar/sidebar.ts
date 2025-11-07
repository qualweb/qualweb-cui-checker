import { createApp } from 'vue';
import router from './router';
import App from './App.vue';
import store from './store';

async function sendActionToActiveTab(
  action: string,
  payload: Record<string, any> = {},
): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return reject(chrome.runtime.lastError);
      }
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action, ...payload }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return reject(chrome.runtime.lastError);
          }
          if (response === undefined) {
            console.warn('No response received before the message port closed.');
            return reject(new Error('No response received before the message port closed.'));
          }
          resolve(response);
        });
      } else {
        reject(new Error('No active tab found'));
      }
    });
  });
}
function getInitialRoute(): Promise<string> {
  return new Promise(async (resolve) => {
    let url: string = await getUrl();
    let hostname = new URL(url).hostname;
    let selectors = await chrome.storage.local.get('qualweb-selectors');
    const selectorsForHostname = JSON.parse(
      JSON.stringify(selectors['qualweb-selectors']?.[hostname] || {}),
    );
    console.log('selectors', selectorsForHostname);
    if (selectorsForHostname && Object.keys(selectorsForHostname).length > 0) {
      await setStoredSelectors(selectorsForHostname);
      resolve('/ready');
      return;
    } else {
      resolve('/');
    }
  });
}
async function getUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].url) {
        console.error('No active tab with a URL found.');
        return reject(new Error('No URL found for the active tab'));
      }
      resolve(tabs[0].url);
    });
  });
}
async function setStoredSelectors(selectors: Record<string, any>) {
  return sendActionToActiveTab('setStoredSelectors', {
    element: selectors,
  });
}

getInitialRoute().then((initialRoute) => {
  router.replace(initialRoute).finally(() => {
    const app = createApp(App);
    app.use(router);
    app.use(store);
    app.mount('#app');
  });
});
