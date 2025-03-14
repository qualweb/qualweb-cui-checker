import { HTMLPlacementIdentifier } from "../util";
export function newMessage(text:string,createMessage:(text:string)=>HTMLPlacementIdentifier):HTMLElement{
    let messageParemeters = createMessage(text);
    // identify placement
    let nodeDest = document.querySelector(messageParemeters.parentSelector);

    if (nodeDest) {
        const template = document.createElement("template");
        template.innerHTML = messageParemeters.messageContainer;
        let containerMessage = template.content.firstChild as HTMLElement;
        containerMessage.innerHTML = messageParemeters.message;
        nodeDest.appendChild(containerMessage);
    }  
    return nodeDest as HTMLElement;

}

export function appendMessage(text:string,element:HTMLElement,createMessage:(text:string)=>HTMLPlacementIdentifier):HTMLElement{
    let messageParemeters = createMessage(text);
    // identify placement
        
        let template = document.createElement("div");
        template.innerHTML = messageParemeters.message;
        let containerMessage = template.childNodes[0] as HTMLElement;
        containerMessage.innerHTML = messageParemeters.message;
        element.appendChild(containerMessage);
        
          


        return element as HTMLElement;

}


export function  setTyping(type:()=>HTMLPlacementIdentifier){
        let typing = type();

        let nodeDest = document.querySelector(typing.parentSelector);
        if(nodeDest){
        const template = document.createElement("template");
        template.innerHTML = typing.messageContainer;
        let containerMessage = template.content.firstChild as HTMLElement;
        containerMessage.innerHTML = typing.message;
        nodeDest.appendChild(containerMessage);
       
        }  

    };

export function unsetTyping(selector:string){
        let nodeDest = document.querySelector(selector);
        nodeDest?.remove();
    }

export function newQueryMessage(text:string,createMessage:(text:string,options:string[])=>HTMLPlacementIdentifier,options:string[]):HTMLElement{
    let messageParemeters = createMessage(text,options);
    // identify placement
    let nodeDest = document.querySelector(messageParemeters.parentSelector);

    if (nodeDest) {
        const template = document.createElement("template");
        template.innerHTML = messageParemeters.messageContainer;
        let containerMessage = template.content.firstChild as HTMLElement;
        containerMessage.innerHTML = messageParemeters.query || "";
        nodeDest.appendChild(containerMessage);
    }  
    return nodeDest as HTMLElement;

}