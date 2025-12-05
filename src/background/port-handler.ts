import { ACTION, PORT_NAME } from './action-type';
import InteractionManager from './InteractionManager';
import { PortResponse } from './States';
import PortCommunication from './PortCommunication';
import { ERROR } from './errors';

// adicionar um mutex para garantir que apenas uma interação ocorra de cada vez

export function initPortHandler(): void {
  console.log('Background port-handler initialized.');

  if (!chrome.runtime.onConnect.hasListener(handlerPortInteraction)) {
    chrome.runtime.onConnect.addListener(handlerPortInteraction);
  }

  function handlerPortInteraction(port: chrome.runtime.Port) {
    if (PortCommunication.getInstance().isMutexLocked()) {
      setTimeout(() => {
        port.postMessage(ERROR.INTERACTION_IN_PROGRESS);
        port.disconnect();
      }, 1000);
      return;
    }

    switch (port.name) {
      case PORT_NAME.CONTENT_SCRIPT:
        handleContentPort(port);
        break;
      case PORT_NAME.SIDEBAR:
        handleSidePanelPort(port);
        break;
      default:
        console.warn('Unknown port:', port.name);
    }
  }
  // Handler for Sidepanel PORT .
  function handleSidePanelPort(port: chrome.runtime.Port) {
    InteractionManager.getInstance().cleanInteractionManager();
    PortCommunication.getInstance().buildPortSidepanel(port);

    console.log('Sidebar port connected');

    //Message listener from sidebar PORT
    port.onMessage.addListener((msg) => {
      // Cancel interaction
      if (msg.action === ACTION.CANCEL_INTERACTION) {
        console.log('Cancelling interaction from sidebar');
        endInteractionAndCleanup();

        // Skip interaction
      } else if (msg.action === ACTION.SKIP_INTERACTION) {
        console.log('Skipping interaction from sidebar');
        InteractionManager.getInstance().skipInteraction();
      }
    });

    // port disconnection handler
    port.onDisconnect.addListener(() => {
      // Handle disconnection if needed
      console.log('Sidebar port disconnected');
      port.postMessage({ action: 'disconnected' });
      endInteractionAndCleanup();
    });
  }

  // Case 2 - Content Script Port
  function handleContentPort(port: chrome.runtime.Port) {
    PortCommunication.getInstance().buildPortContent(port);
    console.log('Content script port connected');

    port.onMessage.addListener((msg) => {
      // Handle messages from content script

      // Initialize interaction
      if (msg.action === ACTION.INIT_INTERACTION) {
        InteractionManager.getInstance()
          .buildLanggraph(msg.settings)
          .then(() => {
            PortCommunication.getInstance().sendMessageToSidepanel({ status: 'ready' });
          })
          .catch((error) => {
            console.log('Error building Langgraph:', error);
            PortCommunication.getInstance().sendMessageToSidepanel(ERROR.LANGGRAPH_BUILD_ERROR);
            endInteractionAndCleanup();
          });
        PortCommunication.getInstance().lockMutex();
        // Receive user message and process
      } else if (msg.action === ACTION.MESSAGE) {
        console.log('Received message from content script:', msg.message);

        // start async processing of messages
        InteractionManager.getInstance()
          .streamEvents(msg.message, msg.config)
          .then((finalOutput) => {
            console.log('Final output from interaction:', finalOutput);
            if (finalOutput.response) {
              PortCommunication.getInstance().sendMessageToContent({
                action: ACTION.MESSAGE,
                data: finalOutput,
              });
            }
            if (finalOutput.status === 'completed') {
              // end interaction and cleanup
              endInteractionAndCleanup();
            }
          })
          .catch((error) => {
            if (error.message.includes('AuthenticationError') || error.message.includes('401')) {
              PortCommunication.getInstance().sendMessageToSidepanel(ERROR.AUTH_API_ERROR);
            } else {
              PortCommunication.getInstance().sendMessageToSidepanel(ERROR.UNKNOWN_ERROR);
            }
            console.log('Error during interaction:', error);
            endInteractionAndCleanup();
          });
      }
    });

    port.onDisconnect.addListener(() => {
      // Handle disconnection if needed
      endInteractionAndCleanup();
    });
  }
}

export function sendResponse(port: chrome.runtime.Port, response: PortResponse) {
  port.postMessage(response);
}

export function endInteractionAndCleanup() {
  // send message to both ports to stop interaction
  InteractionManager.getInstance().cancelInteraction();
  InteractionManager.getInstance().cleanInteractionManager();
}
