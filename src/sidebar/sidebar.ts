import Vue from "vue";
import router from "./router";
import App from "./App.vue";
import { messages } from "../utils/messagesToSend";
import store from "./store";

new Vue({
  router,
  store,
  async created() {
    let currentRoute = await getRoute();
    if (currentRoute) {
      console.log("Navigating to saved route:", currentRoute);
      this.$router.push(currentRoute);
    } else {
      console.log("Navigating to home page");
      this.$router.push("/");
    }
  },
  render: (h) => h(App),
}).$mount("#app");

router.afterEach(async (to: any, from: any) => {
  await saveRoute(to.fullPath);
});

function getRoute(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(
          activeTab.id,
          { action: "getRoute" },
          (response: { route?: string }) => {
            console.log(response);
            if (response.route) {
              resolve(response.route);
            }
          }
        );
      }
    });
  });
}

function saveRoute(saveRoute: string): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(
          activeTab.id,
          {
            action: "saveRoute",
            route: saveRoute,
          },
          (response: any) => {
            resolve(response);
          }
        );
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const chatButton = document.getElementById("chatButton");
  if (chatButton) {
    chatButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
          chrome.tabs.sendMessage(
            activeTab.id!,
            { action: "typeMessages", messages },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error sending message:",
                  chrome.runtime.lastError.message
                );
              } else {
                console.log(response?.status);
              }
            }
          );
        }
      });
    });
  }

  const identifyButton = document.getElementById("identifyButton");
  if (identifyButton) {
    identifyButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.id) {
          chrome.tabs.sendMessage(activeTab.id, { action: "startSelection" });
          window.close();
        }
      });
    });
  }

  const identifyMicButton = document.getElementById("identifyMicButton");
  if (identifyMicButton) {
    identifyMicButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.id) {
          chrome.tabs.sendMessage(activeTab.id, {
            action: "startMicSelection",
          });
          window.close();
        }
      });
    });
  }

  const voiceInputButton = document.getElementById("voiceInputButton");
  if (voiceInputButton) {
    voiceInputButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
          chrome.tabs.sendMessage(
            activeTab.id!,
            { action: "startVoiceInput", messages },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error sending message:",
                  chrome.runtime.lastError.message
                );
              } else {
                console.log(response?.status);
              }
            }
          );
        }
      });

      // setTimeout(() => {
      //   const audio = new Audio("../audio/chatbotClip1.mp3");
      //   audio.play();
      // }, 1500);
    });
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);

    }
    if (tabs[0] && tabs[0].id !== undefined) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "load" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
         
          } 
        }
      );
    } else {
      console.error("Tab ID not found.");
    }
  });
  const evaluateButton = document.getElementById("evaluateButton");
  const evaluatingDiv = document.getElementById("evaluating");

  if (evaluateButton && evaluatingDiv) {
    evaluateButton.addEventListener("click", () => {
      evaluatingDiv.style.display = "block";

      const actRulesCheckbox = document.getElementById(
        "actRulesCheckbox"
      ) as HTMLInputElement;
      const wcagTechniquesCheckbox = document.getElementById(
        "wcagTechniquesCheckbox"
      ) as HTMLInputElement;
      const bestPracticesCheckbox = document.getElementById(
        "bestPracticesCheckbox"
      ) as HTMLInputElement;

      const actRules = actRulesCheckbox?.checked ?? false;
      const wcagTechniques = wcagTechniquesCheckbox?.checked ?? false;
      const bestPractices = bestPracticesCheckbox?.checked ?? false;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.id) {
          chrome.tabs.sendMessage(activeTab.id, {
            action: "evaluate",
            actRules: actRules,
            wcagTechniques: wcagTechniques,
            bestPractices: bestPractices,
          });
        }
      });
    });
  }
});
