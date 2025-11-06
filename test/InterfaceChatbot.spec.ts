import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { JSDOM } from 'jsdom';
import InterfaceChatbot from '../src/content/detection/InterfaceChatbot';
import { ChatBotSelectors } from '../src/utils/types';

describe('InterfaceChatbot', function() {

    let chatbot: InterfaceChatbot;
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
        chatbot = null as any;

        delete (global as any).document;
        delete (global as any).window;
    });

    describe('Initiating Object', () => {
        it('should initialize with default values', () => {
            // act
            chatbot = new InterfaceChatbot();
            //assert
            expect(chatbot.getWindowElement()).to.be.null;
            expect(chatbot.getMessagesSelector()).to.equal('');
            expect(chatbot.getDialogElement()).to.be.null;
        });

        it('should initialize selectors with empty strings', () => {
            // act
            chatbot = new InterfaceChatbot();
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
            chatbot = new InterfaceChatbot();
            const testSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
            };

            chatbot.loadInterface(testSelectors);

            //assert
            expect(chatbot.getSelectors()).to.deep.equal(testSelectors);
            expect(chatbot.getInputElement()).to.not.be.null;
            expect(chatbot.getMessagesSelector()).to.not.be.empty;
            expect(chatbot.getDialogElement()).to.not.be.null;
            expect(chatbot.getWindowElement()).to.not.be.null;
        });
          it('iframe - should set selectors and initiate elements', () => {
            // act
            chatbot = new InterfaceChatbot();
            const testSelectors: ChatBotSelectors = {
                iframeSelector: '#myFrame',
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
            };

            chatbot.loadInterface(testSelectors);

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
            chatbot = new InterfaceChatbot();
            const testSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window'
            };

            chatbot.loadInterface(testSelectors);

            //assert
            expect(chatbot.isElementsLoaded()).to.be.true;
        });
             it('should return true when all elements are loaded with mic', () => {
            // act
            chatbot = new InterfaceChatbot();
            const testSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
                microphoneSelector: '#mic'
            };

            chatbot.loadInterface(testSelectors);
            //assert
            expect(chatbot.isElementsLoaded()).to.be.true;
        });
    });

    describe('getters and setters', () => {
        it('should get and set selectors', () => {
            // act
            chatbot = new InterfaceChatbot();
            const newSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
                microphoneSelector: '#mic'
            };

            chatbot.loadInterface(newSelectors);
            
            //assert
            expect(chatbot.getSelectors()).to.deep.equal(newSelectors);
        });
         it('should get inputElement', () => {
            // act
            chatbot = new InterfaceChatbot();
            const newSelectors: ChatBotSelectors = {
                inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
                microphoneSelector: '#mic'
            };

            chatbot.loadInterface(newSelectors);
            
            //assert
            expect(chatbot.getInputElement()).to.be.not.null;
        });


    });

    describe('clearObject', () => {
        it('should reset all properties to initial state', () => {

            // act
            chatbot = new InterfaceChatbot();
            const testSelectors: ChatBotSelectors = {
                  inputSelector: '#input',
                messagesSelector: '.messages',
                dialogSelector: '#dialog',
                windowSelector: '#window',
                microphoneSelector: '#mic'
            };

            chatbot.loadInterface(testSelectors);
            chatbot.clearObject();
            
            //assert
            expect(chatbot.getWindowElement()).to.be.null;
            expect(chatbot.getInputElement()).to.be.null;
            expect(chatbot.getMessagesSelector()).to.equal('');
            expect(chatbot.getDialogElement()).to.be.null;
            expect(chatbot.getSelectors()).to.deep.equal({
                inputSelector: '',
                messagesSelector: '',
                dialogSelector: '',
                windowSelector: ''
            });
        });
    });
});