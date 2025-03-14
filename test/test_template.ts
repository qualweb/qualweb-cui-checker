import { Browser, BrowserContext } from 'puppeteer';
import { expect } from 'chai';
import { ChatBotConfig, ChatBotTest, launchBrowser } from './util';
import { ChatBotInterface } from '../src/utils/types';
import { chatbotInterface,setChatbotInterface } from '../src/content/Detection';
import { text } from 'stream/consumers';
/**
 * Constructs a test suite for a given CUI check. This is a generalized
 * builder, based on the case that many CXX unit tests are close to identical.
 * 
 * 
 */
export function buildTest(chatbot: string, testCases:ChatBotTest) {
    
  describe(chatbot, () => {
    let browser: Browser;
    let browserContext: BrowserContext;
    


    // Fire up Puppeteer before any test runs. All tests are run in their
    // own browser contexts, so restarting puppeteer itself should not be
    // necessary between tests.
    before(async () => browser = await launchBrowser());

    // Close the puppeteer instance once all tests have run.
    after(async () => await browser.close());

    // Create a unique browser context for each test.
    // createIncognitoBrowserContext() is no longer supported. Is that a problem?
    beforeEach(async () => browserContext = await browser.createBrowserContext());

    // Make sure the browser contexts are shut down, as well.
    afterEach(async () => await browserContext?.close());


    setChatbotInterface(testCases.chatbotInterface);

      it(`test1 `, async function () {
        this.timeout(0);
        let page = await browserContext.newPage();

        await page.setContent(testCases.code);
        await page.evaluate((testCase: ChatBotTest) => {
          testCase.messages.client('Hello');
          // expect that there is a Hello text in dom 
          const botMessage = document.querySelector(testCase.chatbotInterface.messagesSelector);
          let isInserted = botMessage?.textContent?.includes('Hello');
          expect(isInserted).to.be.true;
        
        }, testCases);
      });

  
});
} 
