
import { expect } from 'chai';
import { ChatBotTest } from '../util';
import { ChatBotInterface } from '../../src/utils/types';
import { chatbotInterface,setChatbotInterface } from '../../src/content/Detection';
import { captureResponse,isChatBotMessage } from '../../src/content/chatInteraction';
import { ACTRulesRunner } from '@qualweb/act-rules/dist';
import { awaitSync } from '@kaciras/deasync';
import  * as InteractionLib from './lib';
import { JSDOM } from 'jsdom';


import * as path from "path";
import * as fs from "fs";
import { reasonQuestions } from '../../src/langchain/reasoning';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOllama } from '@langchain/ollama';
import { interactWithLLM } from '../../src/content/Interaction';



/**
 * Constructs a test suite for a given CUI check. This is a generalized
 * builder, based on the case that many CXX unit tests are close to identical.
 * 
 * 
 */

export function buildTest(chatbot: string, testCase:ChatBotTest) {
    
  describe(chatbot + " Interaction", () => {
    const bot = testCase.messages.bot;
    const client = testCase.messages.client;
    const typing = testCase.messages.type;
    
    beforeEach(  () => {
      // Configurar JSDOM com um HTML inicial
      let dom = new JSDOM(testCase.code);


      const cuiChecksPath = path.join(__dirname, "../../node_modules/@qualweb/cui-checks/dist/__webpack/cui.bundle.js");
      const cuiBundleContent = fs.readFileSync(cuiChecksPath, "utf-8");

      const wcagPath = path.join(__dirname, "../../node_modules/@qualweb/wcag-techniques/dist/__webpack/wcag.bundle.js");
      const wcagBundleContent = fs.readFileSync(wcagPath, "utf-8");

      const actPath = path.join(__dirname, "../../node_modules/@qualweb/act-rules/dist/__webpack/act.bundle.js");
      const actBundleContent = fs.readFileSync(actPath, "utf-8");
      dom.window.eval(cuiBundleContent);
      dom.window.eval(wcagBundleContent);
      dom.window.eval(actBundleContent);

      // Set the document and window as global variables
      global.document = dom.window.document;
      global.window = dom.window as unknown as Window & typeof globalThis;
      global.navigator = dom.window.navigator;
      global.HTMLElement = dom.window.HTMLElement;
      global.XPathResult = dom.window.XPathResult;
      global.MutationObserver = dom.window.MutationObserver;
      global.Node = dom.window.Node;
   

      
    });



       setChatbotInterface(testCase.chatbotInterface);

      it(`Create bot message `, function () {

      
        InteractionLib.newMessage('Hello', bot);
 
          // expect that there is a Hello text in dom 
          const botMessage:HTMLDivElement[] = Array.from(document.querySelectorAll(testCase.chatbotInterface.messagesSelector)) as HTMLDivElement[];
          // GET TEXT CONTENT
          let textContent = botMessage.map((element)=>" " + element.textContent +" ").join("\n ");
     
          let isInserted = textContent.includes('Hello');
          expect(isInserted).to.be.true;
      });



      it(`Check if identifies elements with selectors `,  function () {

        let chatbotInterface = document.querySelector(testCase.chatbotInterface.selectors.window[0]);
        expect(chatbotInterface).to.be.not.null;
        chatbotInterface = document.querySelector(testCase.chatbotInterface.selectors.input[0]);
        expect(chatbotInterface).to.be.not.null;
        chatbotInterface = document.querySelector(testCase.chatbotInterface.selectors.messages[0]);
        expect(chatbotInterface).to.be.not.null;
        chatbotInterface = document.querySelector(testCase.chatbotInterface.selectors.dialog[0]);
      
        

      });

      it(`Is added bot message identified as such?`,  function (this: Mocha.Context,done:Mocha.Done) {
        InteractionLib.newMessage('qualweb-test-1', testCase.messages.bot);
        let botMessage = document.querySelectorAll(testCase.chatbotInterface.messagesSelector);
        let botMessageInputed = botMessage[botMessage.length-1];
        expect(botMessageInputed.textContent?.trim()).to.be.equal('qualweb-test-1');

      
        let result = isChatBotMessage(botMessageInputed as HTMLElement,testCase.chatbotInterface.messagesSelector);
        expect(result).to.be.true;
        done();


      });

      it(`Detect Bot message `,function (this: Mocha.Context,done:Mocha.Done) {
        this.timeout(100000);
        // wait a few seconds before starting


        setTimeout(() => {
          InteractionLib.newMessage('Hello Bot how are you?', client);
        }
        ,500);
         // if applyable set typing
        if(typing){
          setTimeout(() => {
            InteractionLib.setTyping(typing);
           
          }
          , 700)
     


        setTimeout(() => {
          InteractionLib.unsetTyping(typing().selector!);
        }
        , 3000)
        }

        setTimeout(() => {
          InteractionLib.newMessage('I am fine and you?', bot);
  
        }
        , 3000);




      
        let responses = awaitSync(captureResponse('Hello', '', 10000, testCase.chatbotInterface));
        expect(responses.length).to.be.equal(1);
        //force stop test
        done();

     
    
        
    
      });

      it(`Detect Bot Multiple messages In group (Append) `,function (this: Mocha.Context,done:Mocha.Done) {
        this.timeout(100000);
        // wait a few seconds before starting


        setTimeout(() => {
          InteractionLib.newMessage('Hello Bot how are you?', client);
        }
        ,500);
         // if applyable set typing
        if(typing){
          setTimeout(() => {
            InteractionLib.setTyping(typing);
           
          }
          , 700)
     


        setTimeout(() => {
          InteractionLib.unsetTyping(typing().selector!);
        }
        , 4000)
        }

        let messageBot:HTMLElement;

        setTimeout(() => {
          messageBot= InteractionLib.newMessage('I am fine and you?', bot);
          
  
        }
        , 3000);
        

        setTimeout(() => {
          // create div
          InteractionLib.appendMessage('Wait did i asked you about pies?',messageBot,bot);
  
        }
        , 3500);





      
        let responses = awaitSync(captureResponse('Hello', '', 10000, testCase.chatbotInterface));
        //console.log("responses",responses.map((element)=>element.textContent));

       setTimeout(() => {

       expect(responses.length).to.be.equal(2);
       done();
      }
      , 4000);
       
       
        //force stop test

      });

      it(`Detect Bot Multiple messages In Single response `,function (this: Mocha.Context,done:Mocha.Done) {
        this.timeout(100000);
        // wait a few seconds before starting


        setTimeout(() => {
          InteractionLib.newMessage('Hello Bot how are you?', client);
        }
        ,500);
         // if applyable set typing
        if(typing){
          setTimeout(() => {
            InteractionLib.setTyping(typing);
           
          }
          , 700)
     


        setTimeout(() => {
          InteractionLib.unsetTyping(typing().selector!);
        }
        , 4000)
        }

        let messageBot:HTMLElement;

        setTimeout(() => {
          messageBot= InteractionLib.newMessage('I am fine and you?', bot);
          
  
        }
        , 3000);
        

        setTimeout(() => {
          // create div
          InteractionLib.newMessage('Wait did i asked you about pies?',bot);
  
        }
        , 3500);


        let responses = awaitSync(captureResponse('Hello', '', 10000, testCase.chatbotInterface));
        //console.log("responses",responses.map((element)=>element.textContent));

       setTimeout(() => {

       expect(responses.length).to.be.equal(2);
       done();
      }
      , 4000);
       

      });

      it(`Detect if message added is of type Query`,function (this: Mocha.Context,done:Mocha.Done) {
        this.timeout(100000);

        setTimeout(() => {
          InteractionLib.newMessage('Hello Bot how are you?', client);
        }
        ,500);
         // if applyable set typing
        if(typing){
          setTimeout(() => {
            InteractionLib.setTyping(typing);
           
          }
          , 700)
     


        setTimeout(() => {
          InteractionLib.unsetTyping(typing().selector!);
        }
        , 4000)
        }

        setTimeout(() => {
          InteractionLib.newQueryMessage("Select Options:", bot,["Continue Talking","Ask promotions","Quit"]);
        } , 4000);
        let responses = awaitSync(captureResponse('Hello', '', 10000, testCase.chatbotInterface));
        //console.log("responses",responses.map((element)=>element.textContent));
 
       // let question = awaitSync(reasonQuestions( responses[0].outerHTML as string ));
       let ollama = new ChatOllama({
        baseUrl: "http://localhost:11434",
        model: "mistral:7b-instruct",
        temperature: 0,
       });

       let typeOfMessage = awaitSync(prompDetect.pipe(ollama).invoke({code:responses[0].outerHTML as string,previousMessage:"Hello Bot how are you?"}));
       console.log("Type of message",typeOfMessage.content);
       
       let question = awaitSync(prompt.pipe(ollama).invoke({code:responses[0].outerHTML as string}));

       let choosenObjective = awaitSync(prompt2.pipe(ollama).invoke({message:"I dont want to talk with you" as string, options:question,objective:"Evaluate acessibility of currency of the chatbot"}));
       console.log("objective",choosenObjective.content);

       let selectorOfChoice = awaitSync(prompt3.pipe(ollama).invoke({element:choosenObjective,code:responses[0].outerHTML as string}));

       console.log("Selector ",selectorOfChoice.content);

        /*
        expect(questionsParsed.options).to.include("Continue Talking");
        expect(questionsParsed.options).to.include("Ask promotions");
        expect(questionsParsed.options).to.include("Quit");
        expect(questionsParsed.question).to.be.equal("Select Options:");
        */
        done();
      });

      
      it(`Detect if message added is of type Query`,async function (this: Mocha.Context,done:Mocha.Done) {
        this.timeout(100000);
        setTimeout(() => {
          InteractionLib.newMessage('Não posso reponder a  isso', bot);
        }
        ,5000);
         // if applyable set typing
        if(typing){
          setTimeout(() => {
            InteractionLib.setTyping(typing);
           
          }
          , 4000)
     


        setTimeout(() => {
          InteractionLib.unsetTyping(typing().selector!);
        }
        , 5000)
        }
         await interactWithLLM()
        
        done();
      });
}); 




let prompDetect = PromptTemplate.fromTemplate(`
You are HTML. You will receive HTML code from a chatbot's response. Based on the content, determine the type of the answer in one word from the following valid options: ["message", "options", "interface"].

- "message": Standard HTML with text from the chatbot.
- "options": HTML code with selectable options or buttons. ( Have in mind that the options are not always buttons as a element can be associated with javascript to so analyse context and previous messages)
- "interface": HTML code containing the chatbot interface, including input options.

Your task is to identify which category the provided HTML belongs to. Your output must be **strictly** in JSON format with no additional text, comments, or explanations.

Previous Message: 
{previousMessage}

HTML:
{code}

`);
let prompt = PromptTemplate.fromTemplate(`
You are an HTML reasoning chatbot. Based on a portion of a chatbot's answer, you will determine whether it is a normal response or a button query for mouse input. 
Your output must be **strictly** in JSON format with no additional text, comments, or explanations.

JSON SCHEMA:
    "question": "question text available in html that describes the options",
    "options": ["option 1", "option 2", "option 3", "option 4"]

If it is a normal text answer, output:
    "question": null,
    "options": null

    HTML:
    {code}
    
`);

let prompt2 = PromptTemplate.fromTemplate(`
You are a decision-maker tasked with selecting the most appropriate option from the ones presented by the chatbot. The options are provided in response to a user's query, and your goal is to choose the option that best helps the user achieve their objective.

Previous User Message: {message}
Options Offered by Chatbot: {options}
User's Objective: {objective}

Based on the user's question and their objective, determine which option will best help them achieve their goal.
Answer only with the option that you believe is most appropriate with no comments or additional text.
  `);

let prompt3 = PromptTemplate.fromTemplate(`
You are an HTML expert. Based on the provided partial HTML code, calculate the **direct relative XPath**  for the element that contains the text provided. 

Element that contains text: {element}

HTML Code: {code}

Expected Output: Provide the **direct relative XPath**  for the element in the following **JSON format**:

  "xpath": "relative_xpath"

Important Notes:
Only provide RELATIVE XPath (not absolute).
Ensure the XPath is optimized and does not rely on brittle identifiers or unnecessary levels in the hierarchy.
If there are multiple potential matches, choose the one that is most specific to the task.
NO COMMENTS OR ADDITIONAL TEXT ALLOWED.
`);
}