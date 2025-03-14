
import { expect } from 'chai';
import { ChatBotTest } from '../util';
import { ChatBotInterface } from '../../src/utils/types';
import { chatbotInterface,setChatbotInterface } from '../../src/content/Detection';
import { captureResponse,isChatBotMessage } from '../../src/content/chatInteraction';
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";

import { JSDOM } from 'jsdom';


import * as path from "path";
import * as fs from "fs";
import { initateDetection } from '../../src/langchain/detection';

/**
 * Constructs a test suite for a given CUI check. This is a generalized
 * builder, based on the case that many CXX unit tests are close to identical.
 * 
 * 
 */
export function buildTest(chatbot: string, testCase:ChatBotTest) {
    
  describe(chatbot + " Detection", () => {

    
    beforeEach(() => {
      // Configurar JSDOM com um HTML inicial
      let dom = new JSDOM(testCase.code, {
        pretendToBeVisual: true 
    });
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

      it(`Identify elements Input `, async function (this: Mocha.Context,done: Mocha.Done) {
        this.timeout(200000);
        //let answer = await initateDetection(document);
       // console.log('Answer:', answer);
        done();

      
      });
});
} 

