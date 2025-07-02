import { mapActions } from "vuex";
import { ChatBotConfig, ChatBotTest } from "../util";


const chatBotConfig: ChatBotConfig = 
    {
    code:`
    <html>
    <head>
    <title>Teste</title>
    </head>
    <body>
    <div id="rasaWebchatPro"><div class="" style=""><div class="rw-widget-container rw-chat-open"><div class="rw-conversation-container"><div class="rw-header-and-loading"><div class="rw-header "><img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="chat avatar"><div class="rw-header-buttons"><button class="rw-close-button"><img class="rw-close rw-default" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSIwIDAgMzU3IDM1NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzU3IDM1NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnIGlkPSJjbGVhciI+CgkJPHBvbHlnb24gcG9pbnRzPSIzNTcsMzUuNyAzMjEuMywwIDE3OC41LDE0Mi44IDM1LjcsMCAwLDM1LjcgMTQyLjgsMTc4LjUgMCwzMjEuMyAzNS43LDM1NyAxNzguNSwyMTQuMiAzMjEuMywzNTcgMzU3LDMyMS4zICAgICAyMTQuMiwxNzguNSAgICIgZmlsbD0iI0ZGRkZGRiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" alt="close"></button></div><h4 class="rw-title rw-with-avatar">Ajuda online</h4></div></div><div id="rw-messages" class="rw-messages-container"><div class="rw-group-message rw-from-response"><div class="rw-message rw-with-avatar"><img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile"><div class="rw-response"><div class="rw-message-text"><div class="rw-markdown"><p>Olá, sou a assistente virtual da AT.</p></div></div></div></div><div class="rw-message rw-with-avatar"><img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile"><div><div class="rw-response"><div class="rw-message-text"><div class="rw-markdown"><p>As informações que enviar são utilizadas apenas para lhe prestar esclarecimentos, não sendo utilizadas para efeitos da sua situação tributária específica. 
Não abrangido pelo artigo 68.º da Lei Geral Tributária. Não necessita de enviar dados pessoais que permitam a sua identificação por parte da AT. Para processamento e arquivo dos dados deste sistema, a AT poderá recorrer a serviços de computação na "cloud".
A utilização deste serviço requer um "cookie" mensal para agregar as interações do mesmo utilizador nesse período. 
Para melhoria do serviço prestado, são arquivadas até 180 dias as conversas mantidas, bem como o seu IP e as versões do sistema operativo e navegador de internet.
Consulte a <a href="https://info.portaldasfinancas.gov.pt/pt/quem_somos/privacidade/Pages/privacidade.aspx" target="_blank" rel="noopener noreferrer">Política de Privacidade e Segurança da AT</a>.</p></div></div></div></div></div><div class="rw-message rw-with-avatar"><img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile"><div class="rw-response"><div class="rw-message-text"><div class="rw-markdown"><p><strong>Aceita estes termos e condições de utilização?</strong></p></div></div></div></div></div><div class="rw-group-message rw-from-client"><div class="rw-message rw-with-avatar"><div class="rw-client"><div class="rw-message-text">Sim, li e aceito o tratamento de dados nesses termos.</div></div></div></div><div class="rw-group-message rw-from-response"><div class="rw-message rw-with-avatar"><img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile"><div class="rw-response"><div class="rw-message-text"><div class="rw-markdown"><p>O meu nome é cATia e sou a assistente virtual da AT, Autoridade Tributária e Aduaneira. Em que posso ajudar?</p></div></div></div></div></div></div><form class="rw-sender"><textarea type="text" class="rw-new-message" name="message" placeholder="Escreva alguma coisa..." autocomplete="off" style="height: 23px;"></textarea><button type="submit" class="rw-send" disabled=""><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" enable-background="new 0 0 535.5 535.5" version="1.1" viewBox="0 0 535.5 535.5" xml:space="preserve"><path class="rw-send-icon" d="M0 497.25L535.5 267.75 0 38.25 0 216.75 382.5 267.75 0 318.75z"></path></svg></button></form></div><button type="button" class="rw-launcher rw-hide-sm" aria-label="Assistente Virtual"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSIwIDAgMzU3IDM1NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzU3IDM1NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnIGlkPSJjbGVhciI+CgkJPHBvbHlnb24gcG9pbnRzPSIzNTcsMzUuNyAzMjEuMywwIDE3OC41LDE0Mi44IDM1LjcsMCAwLDM1LjcgMTQyLjgsMTc4LjUgMCwzMjEuMyAzNS43LDM1NyAxNzguNSwyMTQuMiAzMjEuMywzNTcgMzU3LDMyMS4zICAgICAyMTQuMiwxNzguNSAgICIgZmlsbD0iI0ZGRkZGRiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" class="rw-close-launcher rw-default" alt=""></button></div></div></div>
    </body>
    </html>`,
   chatbotInterface :{
    windowElement: null ,
    inputElement: null,
    messagesSelector: 'div[class*=rw-response]',
    dialogElement: null,
    microphoneElement: null,
    selectors : {
        window: ['div[class*=rw-conversation-container]'],
        dialog: ['div[class*=rw-messages-container]'],
      messages: ['div[class*=rw-response]'],
        input: ['textarea[class*=rw-new-message]'],
        microphone: []
    }
    },

};

const portaldasfinancas: ChatBotTest = {
    ...chatBotConfig,
    messages: {
        client(message: string) {
            return {
                parentSelector: chatBotConfig.chatbotInterface.selectors.dialog[0],
                messageContainer: `<div class="rw-group-message rw-from-client"></div>`,
                message: `
                        <div class="rw-message rw-with-avatar">
                            <div class="rw-client">
                                <div class="rw-message-text">${message}</div>
                            </div>
                    </div>
                `
            };
        },
        bot(message: string,options?:string[]) {
            return {
                parentSelector: chatBotConfig.chatbotInterface.selectors.dialog[0],
                messageContainer: `<div class="rw-group-message rw-from-response"></div>`,
                message: `
                        <div class="rw-message rw-with-avatar">
                            <img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile">
                            <div class="rw-response">
                                <div class="rw-message-text">
                                    <div class="rw-markdown">
                                        <p>${message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                `,
                query:`
                     <div class="rw-message rw-with-avatar">
                            <img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile">
                            <div class="rw-response">
                                <div class="rw-message-text">
                                    <div class="rw-markdown">
                                        <p>${message}</p>
                                    </div>
                                </div>
                            <div class="rw-replies">
                               ${options?.map((option) => `<div class="rw-reply">${option}</div>`)};
                               </div>
                    </div> </div>`
            };
        },
        type() {
            return {
                parentSelector: chatBotConfig.chatbotInterface.selectors.dialog[0],
                selector: 'div[class*=rw-typing-indication]',
                messageContainer: ` <div class="rw-message rw-typing-indication rw-with-avatar"></div>`,
                message: `
                        <img src="assets/bot/rs_vertical.png" class="rw-avatar" alt="profile">
                        <div class="rw-response">
                            <div id="wave">
                                <span class="rw-dot"></span>
                                <span class="rw-dot"></span>
                                <span class="rw-dot"></span>
                            </div>
                        </div>

                `
            };
        }
    }
};

export default portaldasfinancas;
