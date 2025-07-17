
import { ChatBotInterface } from "../../utils/types";
import { setChatbotInterface} from "./Detection";

/**
 * 
 * @param selectors 
 */
export function initiateStoredSelectors(selectors : Object) {
     let chatInterface = {
        windowElement: null,
        inputElement: null,
        messagesSelector: "",
        dialogElement: null,
        microphoneElement: null,
        selectors: {
            window: [selectors["windowSelector"]],
            dialog: [selectors["dialogSelector"]],
            messages: [selectors["messagesSelector"]],
            input: [selectors["inputSelector"]],
            microphone: [selectors["microphoneSelector"]]
        }
    } as ChatBotInterface;
 // obtain elements from the selectors
    const windowElement = document.querySelector<HTMLElement>(selectors["windowSelector"]);
    const inputElement = document.querySelector<HTMLElement>(selectors["inputSelector"]);
    const dialogElement = document.querySelector<HTMLElement>(selectors["dialogSelector"]);
    const microphoneElement = document.querySelector<HTMLElement>(selectors["microphoneSelector"]);
    chatInterface.windowElement = windowElement;
    chatInterface.inputElement = inputElement;
    chatInterface.messagesSelector = selectors["messagesSelector"];
    chatInterface.dialogElement = dialogElement;
    chatInterface.microphoneElement = microphoneElement;
    setChatbotInterface(chatInterface);
    console.log("Chatbot interface initiated with stored selectors:", chatInterface);
}
