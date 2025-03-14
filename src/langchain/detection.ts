import { ChatOllama } from "@langchain/ollama";
import { cleanHTML } from "../content/detectChatbot";
import { StructuredOutputParser } from "langchain/output_parsers";
import {detectionPrompt} from "./prompts";
 import { z } from "zod";
 import { JSDOM } from "jsdom";

 
export async function initateDetection(documentOwner:Document) {
    console.log("Detection initiated");

    let htmlElement = documentOwner.documentElement;
    let HTMLCode = cleanHTML(htmlElement);
   
    
    // Define expected JSON schema using Zod
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        xpath_window: z.string().nullable(),
        xpath_input: z.string().nullable(),
        xpath_conversation: z.string().nullable(),
        xpath_bot_selector: z.string().nullable(),
        xpath_microphone: z.string().nullable(),
      })
    );
    
    const formatInstructions = parser.getFormatInstructions();
    
    const model = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: "mistral:7b-instruct",
     // model: "llama3.1"

      numCtx: 15000,
      temperature: 0,
    });

   let prompt = (await detectionPrompt.invoke({ formatInstructions }));

    // Call Ollama with the structured context
    const response = await model.invoke([
      {
        role: "system",
        content: prompt.value,
      },
      {
        role: "user",
        content: HTMLCode,
      },

    ]);

    return response.content
    
    // Parse the response using the output parser
    //const parsedOutput = await parser.parse(response.content);
    //console.log(parsedOutput);

    


}

function chunkHtmlByTagLevel( documentOwner:Document) {
    // Chunk the HTML by tag level
    let htmlElement = documentOwner.documentElement;
    let HTMLCode = cleanHTML(htmlElement);
    const dom = new JSDOM(HTMLCode);
    
    const rootElement = dom.window.document.documentElement;

    const tokenLimit = 1000;
    const chunkedHTML: string[] = [];
    let currentChunk = "";
    rootElement.childNodes.forEach((node) => {
      const nodeElement = (node as HTMLElement).cloneNode;
/*
      if (currentChunk.length + outerHTML.length > tokenLimit) {
        chunkedHTML.push(currentChunk);
        currentChunk = "";
      }
      currentChunk += outerHTML;
    }

    */
    });
}