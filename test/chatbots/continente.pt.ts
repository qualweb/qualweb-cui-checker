import { ChatBotInterface } from "../../src/utils/types";
import { ChatBotConfig, ChatBotTest } from "../util";


const chatBotConfig: ChatBotConfig = {
    code: `
    <html>
        <head>
            <title>Teste</title>
        </head>
        <body>
            <div role="dialog" aria-labelledby="sidebarDialogAssistiveText" class="dockableContainer showDockableContainer" data-aura-rendered-by="14:0" style="font-size:16px;">
                <c-bot-chat-header data-data-rendering-service-uid="8" data-aura-rendered-by="1:16;a" c-botchatheader_botchatheader-host="">
                    <div c-botchatheader_botchatheader="" class="headerDiv">
                        <img class="botLogo" src="https://modelocontinenteb2c.my.salesforce-sites.com/WebformAcelera/resource/1614729023000/LiveChat_logo" alt="Logo" c-botchatheader_botchatheader="">
                        <h2 aria-live="polite" c-botchatheader_botchatheader="">Ajuda Continente</h2>
                        <button c-botchatheader_botchatheader="" aria-live="off">
                            <svg c-botChatHeader_botChatHeader="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path c-botChatHeader_botChatHeader="" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="target-div" c-botchatheader_botchatheader=""></div>
                </c-bot-chat-header>
                <div class="sidebarBody" data-aura-rendered-by="16:0">
                    <div class="sidebarLoadingIndicator" data-aura-rendered-by="17:0">
                        <span role="presentation" tabindex="-1" aria-hidden="true" class="loadingBallContainer animated embeddedServiceLoadingBalls" data-aura-rendered-by="20:0" data-aura-class="embeddedServiceLoadingBalls">
                            <span role="presentation" aria-hidden="true" class="loadingBall first" data-aura-rendered-by="21:0"></span>
                            <span role="presentation" aria-hidden="true" class="loadingBall second" data-aura-rendered-by="22:0"></span>
                            <span role="presentation" aria-hidden="true" class="loadingBall third" data-aura-rendered-by="23:0"></span>
                        </span>
                    </div>
                    <div class="activeFeature hideWhileLoading" data-aura-rendered-by="24:0">
                        <div class="featureBody embeddedServiceSidebarFeature embeddedServiceLiveAgentSidebarFeature" data-aura-rendered-by="144:0" data-aura-class="embeddedServiceSidebarFeature embeddedServiceLiveAgentSidebarFeature">
                            <div class="stateBody embeddedServiceSidebarState embeddedServiceLiveAgentStateChat" data-aura-rendered-by="133:0" data-aura-class="embeddedServiceSidebarState embeddedServiceLiveAgentStateChat">
                                <div tabindex="0" class="messageArea smoothScroll" data-aura-rendered-by="94:0">
                                    <div class="chatSessionStartTime" data-aura-rendered-by="95:0">
                                        <span id="chatWindowCurrentDesc" data-aura-rendered-by="96:0">Conversa iniciada às 10:57</span>
                                    </div>
                                    <ul class="messageWrapper" data-aura-rendered-by="98:0">
                                        <li class="wrapper chatMessage agent embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMessage" data-aura-rendered-by="263:0" data-aura-class="embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMessage">
                                            <div class="isLightningOutContext embeddedServiceLiveAgentStateChatAvatar" data-aura-rendered-by="323:0" data-aura-class="embeddedServiceLiveAgentStateChatAvatar">
                                                <div style="background-image:url(https://modelocontinenteb2c.my.salesforce-sites.com/WebformAcelera/resource/ContiChatImage);" class="avatar" data-aura-rendered-by="326:0">
                                                    <span class="assistiveText" data-aura-rendered-by="327:0"></span>
                                                </div>
                                            </div>
                                            <div class="chatContent " data-aura-rendered-by="274:0">
                                                <c-bot-chat-message data-data-rendering-service-uid="67" data-aura-rendered-by="1:192;a" c-botchatmessage_botchatmessage-host="">
                                                    <div c-botchatmessage_botchatmessage="" class="chat-content agent">
                                                        <lightning-formatted-rich-text c-botchatmessage_botchatmessage="" class="slds-rich-text-editor__output" lwc-4nfn2rc40ch-host="">
                                                            <span lwc-4nfn2rc40ch="" part="formatted-rich-text">Olá ! Em que posso ajudar?</span>
                                                        </lightning-formatted-rich-text>
                                                    </div>
                                                </c-bot-chat-message>
                                            </div>
                                            <div class="nameAndTimeContent" data-aura-rendered-by="276:0">
                                                <div class="agentName" data-aura-rendered-by="330:0">Ajuda</div>
                                                <div class="nameAndTimeDotDivider" data-aura-rendered-by="332:0"></div>
                                                <div class="timeContent " data-aura-rendered-by="386:0">10:57</div>
                                            </div>
                                        </li>
                                        <li class="wrapper chatMessage agent embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMenuMessage" data-aura-rendered-by="372:0" data-aura-class="embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMenuMessage">
                                            <div class="chatContent " data-aura-rendered-by="375:0">
                                                <div class="rich-menu" data-aura-rendered-by="337:0">
                                                    <div class="assistiveText" data-aura-rendered-by="339:0">Escolha uma das seguintes opções</div>
                                                    <ul class="rich-menu-items" data-aura-rendered-by="341:0">
                                                        <li data-aura-rendered-by="343:0">
                                                            <button class="rich-menu-item embeddedServiceLiveAgentStateChatRichItem" data-aura-rendered-by="346:0" data-aura-class="embeddedServiceLiveAgentStateChatRichItem">Encomendas Online</button>
                                                        </li>
                                                        <li data-aura-rendered-by="348:0">
                                                            <button class="rich-menu-item embeddedServiceLiveAgentStateChatRichItem" data-aura-rendered-by="351:0" data-aura-class="embeddedServiceLiveAgentStateChatRichItem">Cartão Continente associado às Lojas Online</button>
                                                        </li>
                                                        <li data-aura-rendered-by="353:0">
                                                            <button class="rich-menu-item embeddedServiceLiveAgentStateChatRichItem" data-aura-rendered-by="356:0" data-aura-class="embeddedServiceLiveAgentStateChatRichItem">2ª Via de fatura Online</button>
                                                        </li>
                                                        <li data-aura-rendered-by="358:0">
                                                            <button class="rich-menu-item embeddedServiceLiveAgentStateChatRichItem" data-aura-rendered-by="361:0" data-aura-class="embeddedServiceLiveAgentStateChatRichItem">Folhetos</button>
                                                        </li>
                                                        <li data-aura-rendered-by="363:0">
                                                            <button class="rich-menu-item embeddedServiceLiveAgentStateChatRichItem" data-aura-rendered-by="366:0" data-aura-class="embeddedServiceLiveAgentStateChatRichItem">Chamar Assistente virtual</button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="nameAndTimeContent" data-aura-rendered-by="377:0"></div>
                                        </li>
                                    </ul>
                                    <div aria-live="polite" aria-relevant="additions text" aria-atomic="false" class="typingIndicatorContainer" data-aura-rendered-by="100:0"></div>
                                    <div class="queuePositionContainer" data-aura-rendered-by="102:0"></div>
                                </div>
                                <div tabindex="-1" class="chasitorInputWrapper dynamicResizeTextOneRow text embeddedServiceLiveAgentStateChatInputFooter" data-aura-rendered-by="107:0" data-aura-class="embeddedServiceLiveAgentStateChatInputFooter">
                                    <div class="footerMenuWrapper" data-aura-rendered-by="218:0">
                                        <embeddedservice-chat-input-footer-menu data-aura-rendered-by="219:0">
                                            <div class="footer-menu">
                                                <lightning-button-menu icon-name="utility:rows" variant="container" class="slds-dropdown-trigger slds-dropdown-trigger_click" lwc-1df1eblanv8-host="">
                                                    <button lwc-1df1eblanv8="" class="slds-button slds-button_icon slds-button_icon-container-more slds-button_icon-large" aria-expanded="false" value="" aria-haspopup="true" type="button" part="button button-icon">
                                                        <lightning-primitive-icon lwc-1df1eblanv8="" variant="bare" lwc-29758b5h9ll-host="">
                                                            <svg focusable="false" aria-hidden="true" viewBox="0 0 520 520" part="icon" lwc-29758b5h9ll="" data-key="rows" class="slds-button__icon">
                                                                <g lwc-29758b5h9ll="">
                                                                    <path d="M465 140H55c-8 0-15-7-15-15V95c0-8 7-15 15-15h410c8 0 15 7 15 15v30c0 8-7 15-15 15zm0 149H55c-8 0-15-7-15-15v-30c0-7 7-14 15-14h410c8 0 15 7 15 15v30c0 7-7 14-15 14zm0 151H55c-8 0-15-7-15-15v-30c0-8 7-15 15-15h410c8 0 15 7 15 15v30c0 8-7 15-15 15z" lwc-29758b5h9ll=""></path>
                                                                </g>
                                                            </svg>
                                                        </lightning-primitive-icon>
                                                        <lightning-primitive-icon lwc-1df1eblanv8="" variant="bare" lwc-6qul4k2dv7m-host="">
                                                            <svg focusable="false" aria-hidden="true" viewBox="0 0 520 520" part="icon" lwc-6qul4k2dv7m="" data-key="down" class="slds-button__icon slds-button__icon_x-small slds-m-left_xx-small">
                                                                <g lwc-6qul4k2dv7m="">
                                                                    <path d="M83 140h354c10 0 17 13 9 22L273 374c-6 8-19 8-25 0L73 162c-7-9-1-22 10-22z" lwc-6qul4k2dv7m=""></path>
                                                                </g>
                                                            </svg>
                                                        </lightning-primitive-icon>
                                                        <span class="slds-assistive-text" lwc-1df1eblanv8="" id="button-label-4">Escolha uma das seguintes opções</span>
                                                    </button>
                                                </lightning-button-menu>
                                            </div>
                                        </embeddedservice-chat-input-footer-menu>
                                    </div>
                                    <div class="chasitorControls" data-aura-rendered-by="110:0">
                                        <label for="120:0" class="assistiveText uiLabel" data-aura-rendered-by="115:0" data-aura-class="uiLabel">
                                            <span class="" data-aura-rendered-by="116:0">Escreva uma mensagem.</span>
                                        </label>
                                        <textarea role="textbox" aria-labelledby="120:0-label" aria-describedby="" id="120:0" placeholder="Escreva uma mensagem" rows="1" class="chasitorText textarea uiInput uiInputTextArea uiInput--default uiInput--textarea" cols="20" data-aura-rendered-by="124:0" data-aura-class="uiInput uiInputTextArea uiInput--default uiInput--textarea" data-interactive-lib-uid="2"></textarea>
                                        <span class="assistiveText" data-aura-rendered-by="130:0">Obrigado por nos contactar!</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    </html>`,
    chatbotInterface: {
        windowElement: null,
        inputElement: null,
        messagesSelector: 'div[c-botchatmessage_botchatmessage]',
        dialogElement: null,
        microphoneElement: null,
        selectors: {
            window: ['div[class*=dockableContainer]'],
            dialog: ['div[class*=messageArea]'],
            messages: ['c-bot-chat-message'],
            input: ['textarea[class*=textarea]'],
            microphone: []
        }
    }
};

const continentePT: ChatBotTest = {
    ...chatBotConfig,
    messages: {
        client(message: string) {
            return {
                parentSelector: 'ul[class=messageWrapper]',
                messageContainer:  ` <li class="wrapper chatMessage chasitor embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMessage" data-aura-rendered-by="766:0" data-aura-class="embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMessage"></li>`,
                message:              `
                    <div class="isLightningOutContext embeddedServiceLiveAgentStateChatAvatar" data-aura-rendered-by="812:0" data-aura-class="embeddedServiceLiveAgentStateChatAvatar"></div>
                    <div class="chatContent " data-aura-rendered-by="769:0">
                        <c-bot-chat-message data-data-rendering-service-uid="163" data-aura-rendered-by="774:0" c-botchatmessage_botchatmessage-host="">
                            <div c-botchatmessage_botchatmessage="" class="messageBox">
                                <div c-botchatmessage_botchatmessage="" class="chat-content chasitor">
                                    <lightning-formatted-text c-botchatmessage_botchatmessage="" lwc-f6gbo863ml-host="">${message}</lightning-formatted-text>
                                </div>
                            </div>
                        </c-bot-chat-message>
                    </div>
                    <div class="nameAndTimeContent" data-aura-rendered-by="771:0"></div>
     
            `
            };
        },
        bot(message: string,options?:string[]) {
            return {
                parentSelector: 'ul[class=messageWrapper]',
                messageContainer:` <li class="wrapper chatMessage agent embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMessage" data-aura-rendered-by="263:0" data-aura-class="embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMessage"></li>`,
                message:  `
                    <div class="isLightningOutContext embeddedServiceLiveAgentStateChatAvatar" data-aura-rendered-by="323:0" data-aura-class="embeddedServiceLiveAgentStateChatAvatar">
                        <div style="background-image:url(https://modelocontinenteb2c.my.salesforce-sites.com/WebformAcelera/resource/ContiChatImage);" class="avatar" data-aura-rendered-by="326:0">
                            <span class="assistiveText" data-aura-rendered-by="327:0"></span>
                        </div>
                    </div>
                    <div class="chatContent " data-aura-rendered-by="274:0">
                        <c-bot-chat-message data-data-rendering-service-uid="67" data-aura-rendered-by="1:192;a" c-botchatmessage_botchatmessage-host="">
                            <div c-botchatmessage_botchatmessage="" class="chat-content agent">
                                <lightning-formatted-rich-text c-botchatmessage_botchatmessage="" class="slds-rich-text-editor__output" lwc-4nfn2rc40ch-host="">
                                    <span lwc-4nfn2rc40ch="" part="formatted-rich-text">${message}</span>
                                </lightning-formatted-rich-text>
                            </div>
                        </c-bot-chat-message>
                    </div>
                    <div class="nameAndTimeContent" data-aura-rendered-by="276:0">
                        <div class="agentName" data-aura-rendered-by="330:0">Ajuda</div>
                        <div class="nameAndTimeDotDivider" data-aura-rendered-by="332:0"></div>
                        <div class="timeContent " data-aura-rendered-by="386:0">10:57</div>
                    </div>
                `,
                query: `
                    <li class="wrapper chatMessage agent embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMenuMessage" data-aura-rendered-by="641:0" data-aura-class="embeddedServiceLiveAgentStateChatItem embeddedServiceLiveAgentStateChatMenuMessage">
                        <div class="isLightningOutContext embeddedServiceLiveAgentStateChatAvatar" data-aura-rendered-by="657:0" data-aura-class="embeddedServiceLiveAgentStateChatAvatar"></div>
                        <div class="chatContent " data-aura-rendered-by="644:0">
                            <div class="rich-menu" data-aura-rendered-by="606:0">
                                <div class="assistiveText" data-aura-rendered-by="608:0">Escolha uma das seguintes opções</div>
                                <ul class="rich-menu-items" data-aura-rendered-by="610:0">
                                ${options?.map((option) => `<li data-aura-rendered-by="612:0">
                                    <button class="rich-menu-item embeddedServiceLiveAgentStateChatRichItem" data-aura-rendered-by="615:0" data-aura-class="embeddedServiceLiveAgentStateChatRichItem">${option}</button>
                                </li>`)}
                                </ul>
                            </div>
                        </div>
                        <div class="nameAndTimeContent" data-aura-rendered-by="646:0">
                            <div class="agentName" data-aura-rendered-by="661:0"></div>
                            <div class="" data-aura-rendered-by="663:0"></div>
                        </div>
                    </li>
                `
            };
        },
        type() {
            return {
                parentSelector: "div[class*=messageArea]",
                selector: 'div[class*=typingIndicatorBall]',
                messageContainer: ` <span class="typingIndicatorBall first" data-aura-rendered-by="1024:0"></span>`,
                message: ``
            };
        }
    }
};

export default continentePT;

