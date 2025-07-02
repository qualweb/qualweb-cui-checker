import puppeteer, { LaunchOptions } from 'puppeteer';
import { ChatBotInterface } from '../src/utils/types';
export interface ChatBotConfig {
  code: string;
  chatbotInterface: ChatBotInterface;

};

export interface HTMLPlacementIdentifier {
  parentSelector: string;
  selector?: string;
  messageContainer: string;
  message: string;
  query?: string;
}

export interface IMessageSystemChatbot {
  client: (message: string) => HTMLPlacementIdentifier;
  bot: (message: string,options?:string[]) => HTMLPlacementIdentifier;
  type?: ((message?: string,options?:string[]) => HTMLPlacementIdentifier)|null;
  serviceInterface?: (() => HTMLPlacementIdentifier)|null;
}

export interface ChatBotTest extends ChatBotConfig {
  messages: IMessageSystemChatbot;


};
const defaultOptions: LaunchOptions = {
  devtools: false,
  headless: true,
};

export async function launchBrowser(launchOptions: LaunchOptions = {}) {
  // Overwrite default options with the ones provided, if any.
  const options = { ...defaultOptions, ...launchOptions };

  if (!options.headless) {
    options.headless = process.env.TEST_PUPPETEER_HEADLESS?.toLowerCase() === 'false' || false;
  }

  if (!options.args) {
    options.args = ['--no-sandbox']
  }

  return await puppeteer.launch(options);
}
