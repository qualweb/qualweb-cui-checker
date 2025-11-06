import { ACTION, PORT_NAME } from "./action-type";
import InteractionManager from "./InteractionManager";

const interactionManager:InteractionManager | null = InteractionManager.getInstance();
chrome.runtime.onConnect.addListener((port) => {
  // Handle connections based on port name

  // Case 1 - Sidebar Port
  if (port.name === PORT_NAME.SIDEBAR) {
      interactionManager?.clearInteractionManager();
      interactionManager.setUIPort(port);
      console.log("Sidebar port connected");

      port.onMessage.addListener((msg) => {
        console.log("Message received from sidebar:", msg);
        if(msg.action === ACTION.CANCEL_INTERACTION){
          console.log("Cancelling interaction from sidebar");
          interactionManager?.cancelInteraction();
          interactionManager?.clearInteractionManager();

        }else if(msg.action === ACTION.SKIP_INTERACTION){
          console.log("Skipping interaction from sidebar");
          interactionManager.skipInteraction();        
        }

      });
    port.onDisconnect.addListener(() => {
      // Handle disconnection if needed
      // TODO:  Actions on port disconnection before time 
      console.log("Sidebar port disconnected");
      port.postMessage({ action: "disconnected" });
      InteractionManager.getInstance().clearInteractionManager();
    });
  
  // Case 2 - Content Script Port
  }else if (port.name === PORT_NAME.CONTENT_SCRIPT) {
    console.log("Content script port connected");

    port.onMessage.addListener((msg) => {

      // Handle messages from content script

        // Initialize interaction
        if(msg.action === ACTION.INIT_INTERACTION){
          console.log("Initializing interaction with settings:", msg.settings);
        
        interactionManager.buildLanggraph(msg.settings);

        // Receive user message and process
        }else if(msg.action === ACTION.MESSAGE){
          console.log("Received message from content script:", msg.message);
          // check if port 
          if(InteractionManager.getInstance().getUIPort()===null){
            return;
          }
        
        // start async processing of messages
        interactionManager.streamEvents(msg.message,msg.config).then((finalOutput) => {
            console.log("Final output from interaction:", finalOutput);
            if(finalOutput.response){
            port.postMessage({ action: ACTION.MESSAGE, data: finalOutput });
            }
            if(finalOutput.status === 'completed'){

              InteractionManager.getInstance().getUIPort()?.postMessage({ action: ACTION.END_INTERACTION });

            } 
    
        }).catch((error) => {
          InteractionManager.getInstance().clearInteractionManager();
          port.disconnect();

          //TODO: handle error properly
          console.error('Error processing messages:', error);
        });

      }
    });

    port.onDisconnect.addListener(() => {
      // Handle disconnection if needed
            // TODO:  Actions on port disconnection before time 
            console.log("Content script port disconnected");
    });
  }
});

