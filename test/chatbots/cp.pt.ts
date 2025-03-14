import { ChatBotInterface } from "../../src/utils/types";
import { ChatBotConfig } from "../util";


export const cpPT: ChatBotConfig = 
    {
    code:`
    <html>
    <head>
    <title>Teste</title>
    </head>
    <body>
    <div id="ebcss-chat-global-wrapper" class="ebcss-chat-window-global-wrapper" style="display: block;"><div id="ebcss-main-chat-wrapper" class="ebcss-main-chat-wrapper" style=""><div class="ebcss-droppable-wrapper" id="ebcss-droppable-wrapper">
            <div class="ebcss-droppable-wrapper-overlay"></div>
            <div class="ebcss-droppable-wapper-parent">
                <div class="ebcss-droppable-wrapper-body">
                    <i class="eb-icons eb-broken-image-icon"></i>
                    <span class="ebcss-droppable-wrapper-body-text">Upload your file to your chat conversation</span>
                </div>
                <div class="ebcss-droppable-wrapper-footer">
                    <span class="ebcss-droppable-wrapper-body-size">O formato do ficheiro não é suportado. Por favor carregue apenas .png, .jpg, .gif, .pdf</span>
                    <span class="ebcss-droppable-wrapper-body-format">Supported file format<br> image/gif, image/jpeg, image/png, application/pdf</span>
                </div>
            </div>
        </div><div id="ebcss-chat-area-wrapper" class="ebcss-chat-area-wrapper" style="height: calc(100% - 72px);"><div id="ebcss-chat-main-wrapper"><div id="ebcss-chat-area" class="ebcss-chat-area col-lg-12 col-md-12 col-sm-12 col-xs-12 float-start " style="padding-bottom: 6px;"><div aria-live="polite" class=" ebcss-without-icon-message ebcss-message-wrapper ebcss-log-wrapper ebcss-bot col-lg-12 col-md-12 col-sm-12 float-start position-relative" data-options="{&quot;TYPE&quot;:&quot;bot&quot;,&quot;MESSAGE&quot;:&quot;Olá! Eu sou o Robot de Atendimento da CP, as minhas respostas são geradas automaticamente.&quot;,&quot;TIMESTAMP&quot;:&quot;Feb 22, 2025, 10:44:17 AM WEST&quot;}"><div class="ebcss-message"><svg aria-hidden="true" class="ebcss-svg-arrow-left" xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 10 20"><path data-name="Subtraction 1" d="M10,35.955l0,0-10-10,10-10v20Z" transform="translate(0 -15.955)" fill="#ffffff"></path></svg>Olá! Eu sou o Robot de Atendimento da CP, as minhas respostas são geradas automaticamente.<div style="justify-content:flex-end" class="message-bubble-features">
        
        <div class="ebcss-speech-and-copy">
            <button title="Copiar" tabindex="0" aria-hidden="false" aria-label="acção" class="ebcss-copyMessageText ebcss-copy-speech-button accessibility accessibility-js">
                <i class="eb-icons eb-copy-2-icon"></i>
            </button>
            <button tabindex="0" aria-hidden="false" aria-label="acção" title="Play" class="ebcss-speechIcons ebcss-copy-speech-button accessibility accessibility-js">
                <i class="ebcss-playerIcons play eb-icons eb-speaker-2-icon"></i>
            </button>
        </div>
        
        </div></div></div><div aria-live="polite" class="  ebcss-message-wrapper ebcss-log-wrapper ebcss-bot col-lg-12 col-md-12 col-sm-12 float-start position-relative" data-options="{&quot;TYPE&quot;:&quot;bot&quot;,&quot;MESSAGE&quot;:&quot;Estes são alguns dos temas em que posso ajudar:&quot;,&quot;TIMESTAMP&quot;:&quot;Feb 22, 2025, 10:44:18 AM WEST&quot;}"><div class="ebcss-client-icon" aria-hidden="true"><img alt="Ícone Chatbot" class="ebcss-image" src="https://cp.enterprisebot.co/assets/botForge/5fa0154e9ea2940aec1f97ff/chat_bot_icon.png" width="36" height="36"></div><div class="ebcss-message"><svg aria-hidden="true" class="ebcss-svg-arrow-left" xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 10 20"><path data-name="Subtraction 1" d="M10,35.955l0,0-10-10,10-10v20Z" transform="translate(0 -15.955)" fill="#ffffff"></path></svg>Estes são alguns dos temas em que posso ajudar:<div style="justify-content:flex-end" class="message-bubble-features">
        
        <div class="ebcss-speech-and-copy">
            <button title="Copiar" tabindex="0" aria-hidden="false" aria-label="acção" class="ebcss-copyMessageText ebcss-copy-speech-button accessibility accessibility-js">
                <i class="eb-icons eb-copy-2-icon"></i>
            </button>
            <button tabindex="0" aria-hidden="false" aria-label="acção" title="Play" class="ebcss-speechIcons ebcss-copy-speech-button accessibility accessibility-js">
                <i class="ebcss-playerIcons play eb-icons eb-speaker-2-icon"></i>
            </button>
        </div>
        
        </div></div></div></div><div id="ebcss-vertical-suggestions" class="ebcss-slider-section-wrapper ebcss-vertical-suggestions"><div class="ebcss-text-card-wrapper"><div class="ebcss-text-card-set" style="left: 0px;"><div id="ebcss-suggestions" class="ebcss-card-wrapper ebcss-suggestions-wrapper"><button id="ebcss-load-previous" class="ebcss-suggestion-more ebcss-suggestion-accessibility-focus accessibility-js ebcss-load-previous" tabindex="0" aria-label="Opções Anteriores" type="button"><a>Opções Anteriores<i class="eb-icons eb-arrow-up-icon" aria-hidden="true"></i></a></button><button title="Horários - Preços - Compras" id="suggestion-0" class="ebcss-suggestion-message accessibility-js suggestion-accessibility ebcss-card" data-hidden="true" data-custom="Horários - Preços - Compras" data-flowid="" tabindex="0" aria-label="Horários - Preços - Compras" type="button"><a>Horários - Preços - Compras</a></button><button title="Avisos" id="suggestion-1" class="ebcss-suggestion-message accessibility-js suggestion-accessibility ebcss-card" data-hidden="true" data-custom="Avisos" data-flowid="" tabindex="0" aria-label="Avisos" type="button"><a>Avisos</a></button><button title="Descontos" id="suggestion-2" class="ebcss-suggestion-message accessibility-js suggestion-accessibility ebcss-card" data-hidden="true" data-custom="Descontos" data-flowid="" tabindex="0" aria-label="Descontos" type="button"><a>Descontos</a></button><button title="Vantagens e Parcerias" id="suggestion-3" class="ebcss-suggestion-message accessibility-js suggestion-accessibility ebcss-card" style="display:none" data-hidden="true" data-custom="Vantagens e Parcerias" data-flowid="" tabindex="0" aria-label="Vantagens e Parcerias" type="button"><a>Vantagens e Parcerias</a></button><button title="O que podes fazer?" id="suggestion-4" class="ebcss-suggestion-message accessibility-js suggestion-accessibility ebcss-card" style="display:none" data-hidden="true" data-custom="O que podes fazer?" data-flowid="" tabindex="0" aria-label="O que podes fazer?" type="button"><a>O que podes fazer?</a></button><button id="ebcss-load-more" class="ebcss-suggestion-more ebcss-suggestion-accessibility-focus accessibility-js ebcss-load-more" style="display:block" data-custom="3" data-flowid="" tabindex="0" aria-label="Mais Opções" type="button"><a>Mais Opções<i class="eb-icons eb-icons eb-arrow-down-icon" aria-hidden="true"></i></a></button></div></div></div></div></div></div>
            <div class="ebcss-messenger-footer ">
        
    <div class="ebcss-text-input-wrapper col-lg-12 col-md-12 col-sm-12 col-xs-12 float-start " style="display: block;">
        <form id="ebcss-messageForm" class="position-relative speech-recognition-enabled ebcss-messageForm user-limit user-attachment">
            <label tabindex="-1" class="ebcss-hide-label-info" aria-hidden="true">ebcss-user hidden Input</label>
            <input tabindex="-1" class="ebcss-hide-label-info" aria-hidden="true" type="hidden" id="ebcss-user" value="">
            <textarea tabindex="0" aria-hidden="false" id="ebcss-m" class="ebcss-text-input-box accessibility-js" autocomplete="off" aria-label="Escreva uma mensagem ou clique no botão do microfone" placeholder="Escreva uma mensagem ou clique no botão do microfone" data-flowid="" style="padding-right: 13px;"></textarea>
            <div>
                <input tabindex="-1" aria-hidden="true" class="ebcss-input-attach accessibility-js" id="attach-user-file" type="file" accept="image/gif, image/jpeg, image/png, application/pdf">
                <label for="attach-user-file" class="attach-user-file-label ">
                    <i tabindex="-1" aria-hidden="true" class="eb-icons accessibility accessibility-js eb-attachment-icon ebcss-attach-icon" title="Anexo"></i>
                </label></div>
            
            <button id="ebcss-speech-record-btn" tabindex="0" aria-hidden="false" aria-label="Enviar" class="ebcss-icon-btn ebcss-send-voice-btn speech-btn-container accessibility accessibility-js" type="button" value="Send">
                    <i class="eb-icons eb-mic-icon"></i>
                </button>
                <button id="ebcss-speech-stop-btn" tabindex="-1" aria-hidden="true" aria-label="Enviar" class="ebcss-icon-btn ebcss-send-voice-btn speech-btn-container accessibility accessibility-js" type="button" value="Send">
                    <span class="ebcss-speech-listening-ring"></span>
                    <i class="eb-icons eb-mic-icon"></i>
                </button>
        </form>
    </div></div>
        </div></div> </body>
    </html>`,
   chatbotInterface :{
    windowElement: null ,
    inputElement: null,
    messagesSelector: 'div[class*=ebcss-message]',
    dialogElement: null,
    microphoneElement: null,
    selectors: {
        window: ['div[id=ebcss-chat-global-wrapper]'],
        dialog: ['div[id=ebcss-chat-area-wrapper]'],
      messages: ['div[class*=ebcss-message]'],
        input: ['textarea[id=ebcss-m]'],
        microphone: []
    }
    } as ChatBotInterface,
  
};


function createClientMessage(text:string){
    return {
        parent: "div[class=rw-messages-container]",
        html: `
            <div class="rw-group-message rw-from-client">
                <div class="rw-message rw-with-avatar">
                    <div class="rw-client">
                        <div class="rw-message-text">${text}</div>
                    </div>
                </div>
            </div>
        `
    };
}

function createBotMessage(text: string) {
    return {
        parent: "div[class=rw-messages-container]", // Selector for the parent
        html: `<div class="rw-group-message rw-from-response">
                   <div class="rw-message rw-with-avatar">
                       <img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile">
                       <div class="rw-response">
                           <div class="rw-message-text">
                               <div class="rw-markdown">
                                   <p>${text}</p>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>`
    };
}
function createIsTyping(){
    return {
        parent: "div[class=rw-messages-container]",
        html: `
            <div class="rw-message rw-typing-indication rw-with-avatar">
                <img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile">
                <div class="rw-response">
                    <div id="wave">
                        <span class="rw-dot"></span>
                        <span class="rw-dot"></span>
                        <span class="rw-dot"></span>
                    </div>
                </div>
            </div>
        `
    };
}