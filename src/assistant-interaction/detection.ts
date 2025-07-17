
import { ChatOllama } from "@langchain/ollama";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { detectionCorrection, detectionPrompt, detectionPromptReduced } from "./prompts/detectionPrompt";

interface LocalLLMResponse {
    chatbot_message_element: string | null;
    microphone_button: string | null;
  }

  
  const sendPromptRequestCorrection = async (body: string,info:string): Promise<LocalLLMResponse> => {
    return new Promise(async (resolve, reject) => {
    let ollama = new ChatOllama({
      model: "mistral:7b-instruct",
      streaming: false,
      temperature: 0,
      numCtx: 15000,
    });
    let model =  detectionCorrection.pipe(ollama);
    const parser = StructuredOutputParser.fromZodSchema(
         z.object({
      chatbot_message_element: z.string().nullable(),
      microphone_button: z.string().nullable(),
    })
    );
    let response = await model.invoke({input:body,information:info,formatInstructions:parser.getFormatInstructions()});
    const content = typeof response.content === "string" ? response.content : response.content?.toString()
    const parsedOutput:LocalLLMResponse = await parser.parse(content);
    resolve(parsedOutput);
    });
  };

  const sendPromptTLocalLLM = async (body: string): Promise<LocalLLMResponse> => {
    return new Promise(async (resolve, reject) => {
    let ollama = new ChatOllama({
      model: "mistral:7b-instruct",
      streaming: false,
      temperature: 0,
      numCtx: 15000,
    });
    let model =  detectionPrompt.pipe(ollama);

    const parser = StructuredOutputParser.fromZodSchema(
         z.object({
      chatbot_message_element: z.string().nullable(),
      microphone_button: z.string().nullable(),
    })
    );
    
    let response = await model.invoke({input:body,formatInstructions:parser.getFormatInstructions()});
    const content = typeof response.content === "string" ? response.content : response.content?.toString()
    const parsedOutput:LocalLLMResponse = await parser.parse(content);
  
  
  
    resolve(parsedOutput);
    });
  };
  

  
  const detetectPageChatbotLocalLLM = async (body: string): Promise<LocalLLMResponse> => {
    return new Promise(async (resolve, reject) => {
    let ollama = new ChatOllama({
      model: "mistral:7b-instruct",
      streaming: false,
      temperature: 0,
      numCtx: 15000,
    });
    let model =  detectionPromptReduced.pipe(ollama);

    const parser = StructuredOutputParser.fromZodSchema(
         z.object({
      chatbot_message_element: z.string().nullable(),
      microphone_button: z.string().nullable(),
    })
    );
    
    let response = await model.invoke({input:body,formatInstructions:parser.getFormatInstructions()});
    const content = typeof response.content === "string" ? response.content : response.content?.toString()
    const parsedOutput:LocalLLMResponse = await parser.parse(content);
  
  
  
    resolve(parsedOutput);
    });
  };
  
  

      export {sendPromptTLocalLLM,LocalLLMResponse,sendPromptRequestCorrection,detetectPageChatbotLocalLLM};