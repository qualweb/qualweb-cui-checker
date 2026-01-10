import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { JSDOM } from 'jsdom';
import ChatbotElements from '../src/content/detection/ChatbotElements';
import {ChatbotElementsFactory} from '../src/content/factories/ChatbotElementsFactory';
import { ChatBotSelectors } from '../src/utils/types';

describe('InterfaceChatbot', function() {

    let chatbot: ChatbotElements;
    let dom: JSDOM;

    beforeEach(function() {

        // Arrange
        if (this.currentTest!.title.includes('iframe')) {
       dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <iframe id="myFrame"></iframe>
      </body>
      </html>
    `);   const iframe = dom.window.document.querySelector<HTMLIFrameElement>('#myFrame')!;
    
    const iframeDom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <div id="window">
          <div id="dialog">
            <div class="messages"></div>
            <div id="input"></div>
            <button id="mic"></button>
          </div>
        </div>
      </body>
      </html>
    `);

    // Definir contentDocument do iframe
    Object.defineProperty(iframe, 'contentDocument', {
      value: iframeDom.window.document,
      writable: false
    });
        }else{
         dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>

            <div id="window">
                 <div id="dialog">
                <div class="messages"></div>
                <div id="input"></div>
                <button id="mic" > </button>
                </div>
                </div>

            </body>
            </html>
        `);
        }
         (global as any).window = dom.window;
        (global as any).document = dom.window.document;
    });

    afterEach(() => {
        ChatbotElementsFactory.destroy();
 
        chatbot = null as any;
        
        delete (global as any).document;
        delete (global as any).window;
    });

    describe('Initiating Object', () => {

        it('should initialize selectors with empty strings', () => {
            // act
            ChatbotElementsFactory.init();
            chatbot = ChatbotElementsFactory.getInstance();
            const selectors = chatbot.getSelectors();

            //assert
            expect(selectors.inputSelector).to.equal('');
            expect(selectors.messagesSelector).to.equal('');
            expect(selectors.dialogSelector).to.equal('');
            expect(selectors.windowSelector).to.equal('');
        });
    });

    describe('Loading elements from chatbot Interface', () => {
        it('should set selectors and initiate elements', () => {
            // act
            ChatbotElementsFactory.init();
            chatbot = ChatbotElementsFactory.getInstance();
            const testSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
            };

            chatbot.setSelectors(testSelectors);

            //assert
            expect(chatbot.getSelectors()).to.deep.equal(testSelectors);
            expect(chatbot.getInputElement()).to.not.be.null;
            expect(chatbot.getMessagesSelector()).to.not.be.empty;
            expect(chatbot.getDialogElement()).to.not.be.null;
            expect(chatbot.getWindowElement()).to.not.be.null;
        });

    });

    describe('isElementsLoaded', () => {
        it('should return true when all elements are loaded', () => {
            // act
            ChatbotElementsFactory.init();
            chatbot = ChatbotElementsFactory.getInstance();
            const testSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window'
            };

            chatbot.setSelectors(testSelectors);

            //assert
            expect(chatbot.checkIfElementsExist()).to.be.true;
        });
             it('should return true when all elements are loaded with mic', () => {
            // act
            ChatbotElementsFactory.init();
            chatbot = ChatbotElementsFactory.getInstance();
            const testSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
                microphoneSelector: '#mic'
            };

            chatbot.setSelectors(testSelectors);
            //assert
            expect(chatbot.checkIfElementsExist()).to.be.true;
        });
    });

    describe('getters and setters', () => {
        it('should get and set selectors', () => {
            // act
            ChatbotElementsFactory.init();
            chatbot = ChatbotElementsFactory.getInstance();
            const newSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
                microphoneSelector: '#mic'
            };

            chatbot.setSelectors(newSelectors);
            
            //assert
            expect(chatbot.getSelectors()).to.deep.equal(newSelectors);
        });
         it('should get inputElement', () => {
            // act
            ChatbotElementsFactory.init();
            chatbot = ChatbotElementsFactory.getInstance();
            const newSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
                microphoneSelector: '#mic'
            };

            chatbot.setSelectors(newSelectors);
            
            //assert
            expect(chatbot.getInputElement()).to.be.not.null;
        });

    });
});