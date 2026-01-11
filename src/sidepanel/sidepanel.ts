import { createApp } from 'vue';
import router from './router';
import App from './App.vue';
import store from './store';
import { handleErrorSidepanel } from '../errors/error.handler.sidepanel';

const app = createApp(App);
app.use(router);
app.use(store);
app.config.errorHandler = (err, instance, info) => {
  console.log('Global Vue Error:', err);

  const args = {
    router: router,
    error: err as Error,
  };
  handleErrorSidepanel(args);
};
app.mount('#app');

//* Listen for URL update messages from content scripts */
if (!chrome.runtime.onMessage.hasListener(handlerSidepanelMessages)) {
  chrome.runtime.onMessage.addListener(handlerSidepanelMessages);
}

function handlerSidepanelMessages(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) {
  console.log('Sidepanel received message:', message);
  if (message.action === 'URL_UPDATE_DETECTED') {
    const currentURL = store.state.sidepanelURL;
    const currentId = store.state.tabId;
    if (currentId !== message.tabId) {
      // not for this tab
      return;
    }
    let hostname = getHostname(message.url);

    if (currentId === message.tabId && currentURL !== hostname) {
      // if url has changed, close sidepanel to avoid inconsistencies
      chrome.runtime.sendMessage({
        action: 'CLOSE_TAB_REQUEST',
        tabId: message.tabId,
      });
      return false;
    } else {
      // if url has not changed, reinject scripts if needed
      chrome.runtime.sendMessage({
        action: 'REINJECT_SCRIPTS',
        tabId: message.tabId,
        url: currentURL,
      });
      return false;
    }
  } else if (message.action === 'RESET_SIDEBAR') {
    // reset sidepanel state
    store.commit('SETSELECTORS', {});
    router.replace('/').then(() => {
      console.log('sidepanel reset to initial route');
    });
    return false;
  }
}
//* Utility function to extract hostname from URL */
function getHostname(url: string): string {
  try {
    const urlObject = new URL(url);

    return urlObject.hostname;
  } catch {
    throw new Error('Invalid URL');
  }
}
