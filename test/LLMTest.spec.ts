import { ChainValues } from '@langchain/core/utils/types';
import { invokeDirectMessageOllama,InvokeModelWithMemory } from '../src/langchain/langchain';
import { expect } from 'chai';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { DynamicTool, tool } from "@langchain/core/tools";
import { set, z } from "zod";
import { RunnableConfig, RunnableLambda, RunnableParallel, RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from '@langchain/core/runnables';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ConversationChain } from 'langchain/chains';
import { AgentExecutor, createReactAgent, createToolCallingAgent } from "langchain/agents";
import { ChatMessageHistory } from 'langchain/memory';
import { BaseChatMessageHistory } from '@langchain/core/chat_history';




describe('Tests for LLM langchain', ()  => {

    
    describe('Simple direct questions without memory', ()  => {
        it('should return the completion response from Ollama', async function(this: Mocha.Context) {
            this.timeout(10000);
            let message =[
            { role: "system", content: "I am a bad bot and i allways reply a JSON saying NO to any question so ever." },
            { role: "user", content: "What is the best programming language?" }]
            const result = await invokeDirectMessageOllama("mistral:7b-instruct", message, 0);
            console.log(result);
            expect(result).to.be.a('string'); // Verifica se a resposta é uma string
    });

    it('Obtain services from chatbot and make question related to one of those services to get data AT', async function(this: Mocha.Context) {
        this.timeout(100000);
        let message = [{ role: 'assistant', content: 'I am a chatbot analyst. I evaluate the responses of another chatbot, and based on its service, I assist users in formulating a set of relevant questions they can ask the chatbot. These questions will help optimize interactions and improve the chatbots service.' },
                    {role: 'user', content: 'Olá, sou a assistente virtual da AT.As informações que enviar são utilizadas apenas para lhe prestar esclarecimentos, não sendo utilizadas para efeitos da sua situação tributária específica. '}];
        
        const response = await invokeDirectMessageOllama("mistral:7b-instruct", message, 0);
       
        console.log(response);
        expect(response).to.be.a('string'); // Verifica se a resposta é uma string
    });

    it('Obtain services from chatbot and make question related to one of those services to get data ctt', async function(this: Mocha.Context) {
        this.timeout(100000);
        let message = [{ role: 'assistant', content: 'I am a chatbot analyst. I evaluate the responses of another chatbot, and based on its service, I assist users in formulating a set of relevant questions they can ask the chatbot. These questions will help optimize interactions and improve the chatbots service.' },
                    {role: 'user', content: 'Olá. Eu sou a Helena, a assistente virtual dos CTT. Utilizo AI Generativa para o ajudar e, apesar de ainda estar em desenvolvimento, aprendo coisas novas todos os dias. Em que posso ajudar? '}];
        
        const response = await invokeDirectMessageOllama("mistral:7b-instruct", message, 0);
       
        console.log(response);
        expect(response).to.be.a('string'); // Verifica se a resposta é uma string
    });


    it('Teste html opções decisão', async function(this: Mocha.Context) {
        this.timeout(100000);
        let message = [{ role: 'assistant', content: 'I am a HTML analyst. I evaluate the responses of another chatbot in HTML Code and i will output in JSON format the options given.' },
                    {role: 'user', content: '<div direction="ltr" data-testid="transition-element-67b34e5af5c7547158cedf45" class="css-1sbnwf0 e14d3hzc1" style=""><div class="css-1rzhsgz er5w9c70"><div role="button" class="text-wrap center-x-y css-ghechv er5w9c71" direction="ltr" tabindex="0">Sim</div><div role="button" class="text-wrap center-x-y css-ghechv er5w9c71" direction="ltr" tabindex="0">Não</div><div role="button" class="text-wrap center-x-y css-ghechv er5w9c71" direction="ltr" tabindex="0">Pretendo mais informações sobre este assunto</div><div role="button" class="text-wrap center-x-y css-ghechv er5w9c71" direction="ltr" tabindex="0">Voltar ao chatbot tradicional</div></div></div> '}];
        
        let response = await invokeDirectMessageOllama("mistral:7b-instruct", message, 0);
        console.log(response);
        message = [{ role: 'assistant', content: 'I am a JSON analyst and decision maker. I evaluate the options given by another chatbot and i will choose the one that allows  me to stay in chat with it. will response JSON format only with the label choosen' },
            {role: 'user', content:response}];
      response = await invokeDirectMessageOllama("mistral:7b-instruct", message, 0);
        
        console.log(response);
        expect(response).to.be.a('string'); // Verifica se a resposta é uma string
    });
});



describe('Simple direct questions with memory', ()  => {
    it('Should remember the last answer', async function(this: Mocha.Context) {
        this.timeout(100000);
        
        let context ="I am a bad bot and i allways reply a JSON saying NO to any question so ever.";
     
        let chain = await InvokeModelWithMemory("mistral:7b-instruct", context, 0);


        let response:ChainValues = await chain.call({ input: "What is the best programming language?" });
        
    
        console.log(response);
 // Verifica se a resposta é uma string
        // parse the response to JSON
   


        
        response = await chain.call({ input: "what was your last answer?" });
    
        console.log(response);
    
        
    });
});

it ('Structured Ouptut fom Olla', async function(this: Mocha.Context) {
   this.timeout(100000);
    let ollama = new ChatOllama({
      model: "mistral:7b-instruct",
      streaming: false,
      temperature : 0,
         format: "json"
    });
        interface Joke {
            setup: string;
            punchline: string;
            rating?: number;
        }
 
        const formatInstructions = `Respond only in valid JSON. The JSON object you return should match the following schema:
{{ setup: string, punchline: string, rating?: number }}
 where setup is the setup of the joke, punchline is the punchline of the joke, and rating is an optional number between 1 and 5 representing how funny the joke is.`;

 const parser = new JsonOutputParser<Joke>();

 // Prompt
const prompt = await ChatPromptTemplate.fromMessages([
    [
      "system",
      "On user query tell a joke. Wrap the output in `json` tags\n{format_instructions}",
    ],
    ["human", "{query}"],
  ]).partial({
    format_instructions: formatInstructions,
  });

  const query = "hello";
  await prompt.format({ query });
  const chain = prompt.pipe(ollama).pipe(parser);
  const response = await chain.invoke({ query });
  console.log(response);
  expect(response.punchline).to.be.a('string');
  expect(response.setup).to.be.a('string');
  expect(response.rating).to.be.a('number');
});

it ('Test ollama run call tools to get current time', async function(this: Mocha.Context) {
    this.timeout(100000);
    let ollama = new ChatOllama({
      model: "llama3-groq-tool-use",

    });


    const currentDateTool = tool( async () => {
        const dateTimezone = new Date().toLocaleString("en-US");
        return `The current date and time is: ${dateTimezone}`;
      }, {
        name: "get_current_date",
        description: "Get the current date and time.",
        schema: z.object({
            
            }),
      });
const llmWithTool = ollama.bindTools([currentDateTool]);

const result = await llmWithTool.invoke(
    "What is the current date? use the tool get_current_date"
  );

console.log(result);

  if (result.tool_calls && Array.isArray(result.tool_calls)) {
    for (const toolCall of result.tool_calls) {
        if (toolCall.name === "get_current_date") {
            console.log("Tool call found!");
            // Extract arguments passed to the tool

            // Call the tool with the proper arguments
            const date = await currentDateTool.invoke({});
            expect(date).to.be.a('string');
            expect(date).to.include('The current date and time is:');
    

            expect(date).to.match(/\d{1,2}\/\d{1,2}\/\d{4}/); 
            
    
            expect(date).to.match(/\d{1,2}:\d{2}/);  
        }
    }
  }

    

});

it("Chain langchain testing",async function(this: Mocha.Context) {
    this.timeout(100000);

    let ollama = new ChatOllama({
      model: "llama3",
      temperature: 0,
      format: "json",
      streaming: false,
      
    });

    const prompt1 = ChatPromptTemplate.fromTemplate("tell me a joke about {topic}");

    const analysisPrompt = ChatPromptTemplate.fromTemplate(
        `Rate the funniness of this joke: {joke}. Provide a rating between 1 and 5 as a number in the following JSON format: "rating": <your_number> . No comments or explanations.
`
      );
      const chain = prompt1.pipe(ollama);
      const composedChain = new RunnableLambda({
        func: async (input: { topic: string }) => {
          const result = await chain.invoke(input);
          return { joke: result };
        },
      }).pipe(analysisPrompt)
      .pipe(ollama);


      let result = await composedChain.invoke({ topic: "bears" });
      console.log(result);
      let json =JSON.parse(result["content"] as string);
      expect(json.rating).to.be.a('number');
      expect(json.rating).to.be.within(1,5);




    
});

it("Chain langchain testing with Stream",async function(this: Mocha.Context) {
  this.timeout(100000);

  let ollama = new ChatOllama({
    model: "llama3",
    temperature: 0,

    
  });

  const prompt1 = ChatPromptTemplate.fromTemplate("tell me a joke about {topic}");

  const analysisPrompt = ChatPromptTemplate.fromTemplate(
      `Describe why this joke is funny joke:{joke}.
`
    );
    const chain = prompt1.pipe(ollama);
    const composedChain = new RunnableLambda({
      func: async (input: { topic: string }) => {
        const result = await chain.invoke(input);
        console.log(result.content);
        return { joke: result.content };
      },
    }).pipe(analysisPrompt)
    .pipe(ollama).pipe(new StringOutputParser());
    

    let result = await composedChain.stream({ topic: "bears" });

    let text ="";
    for await (const chunk of result) {
      console.log(`${chunk}`);
      text+=chunk;
    }
    console.log(text);




  
});


it("Run paralle chains and decide on their outputs",async function(this: Mocha.Context) {
    this.timeout(100000);

    let ollama = new ChatOllama({
      model: "llama3",
      temperature: 0,

      streaming: false,
    });
    const prompt1 = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant THAT only answers YES any question."],
        ["user", " {question}"],
      ]).pipe(ollama);
      const prompt2 = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant THAT only answers NO any question."],
        ["user", " {question}"],
      ]).pipe(ollama);
    // Step 1: Create the ChatPromptTemplate
  
      const mapChain = RunnableParallel.from({
        allwaysYes:prompt1,
        allwaysNo:prompt2,
      });
      
      const result = await mapChain.invoke({ question: "Did man went to mars?" });
      for (const key in result) {
        if(key === "allwaysYes"){
            expect(result[key].content).to.be.a('string');
            expect(result[key].content).to.include('YES');
        }else{
            expect(result[key].content).to.be.a('string');
            expect(result[key].content).to.include('NO');
        }

      }





    });

    it("Custom Runnable function test using constructor",async function(this: Mocha.Context) {
        this.timeout(100000);

        let ollama = new ChatOllama({
          model: "llama3",
          temperature: 0,
    
          streaming: false,
        });
        const letterLength = (input:{name: string}) => {
            return {
              length: input.name.length
            };
        };
        const prompt1 = ChatPromptTemplate.fromTemplate("what is {length} squared? Give me the result in JSON format 'result': <your_number> with NO comments");

        const chain = RunnableLambda.from(letterLength).pipe(prompt1).pipe(ollama);

        const result = await chain.invoke({ name: "Joaquim" });
        console.log(result);
        expect(result["content"]).to.be.a('string');
        expect(result["content"]).to.include('result');
        expect(result["content"]).to.include('49');
      });

      it("Custom Runnable function test with automatic coercion",async function(this: Mocha.Context) {
        this.timeout(100000);
        const storyPrompt = ChatPromptTemplate.fromTemplate(
          "Tell me a short story about {topic}"
        );
        let storyModel = new ChatOllama({
          model: "llama3",
          temperature: 0,
    
          streaming: false,
        });
     
        
        const chainWithCoercedFunction = RunnableSequence.from([
          storyPrompt,
          storyModel,
          (input) => input.content.slice(0, 5),
        ]);
        
        const response = await chainWithCoercedFunction.invoke({ topic: "bears" });
        console.log(response);
        expect(response).to.be.a('string');
        expect(response.length).to.be.equal(5);
      

      }
    );

    it("Custom Runnable function test with Passing run metadata",async function(this: Mocha.Context) {
      this.timeout(100000);

      let model = new ChatOllama({
        model: "llama3",
        temperature: 0,
  
        streaming: false,
      });
   
      const echo = (text: string, config: RunnableConfig) => {
        const prompt = ChatPromptTemplate.fromTemplate(
          "Reverse the following text: {text}"
        );

        const chain = prompt.pipe(model).pipe(new StringOutputParser());
        return chain.invoke({ text }, config);
      };
      let chainStartCount = 0;
      let chainEndCount = 0;
      let didRunLLMStartEvent = false;
      let didRunLLMEndEvent = false;
      const output = await RunnableLambda.from(echo).invoke("foo", {
        tags: ["my-tag"],
        callbacks: [
          {
            handleLLMStart: () => {didRunLLMStartEvent=true;console.log("Vai começar a correr")},
            handleChainStart: (input) => {chainStartCount++;console.log("Vai começar a correr a chain com input: ", input)},
            handleChainEnd: (output) => {chainEndCount++; console.log("Acabou a chain com output: ", output)},
            handleLLMEnd: (output) => {didRunLLMEndEvent=true;console.log(output.generations)},
          },
        ],
      });
      expect(didRunLLMStartEvent).to.be.true;
      expect(didRunLLMEndEvent).to.be.true;
  
      expect(chainStartCount).to.be.equal(4);
      expect(chainEndCount).to.be.equal(4);
     

    }
  );
  it("Created a chain with and recovered initial passed arg",async function(this: Mocha.Context) {
    this.timeout(100000);


    const runnable = RunnableParallel.from({
      passed: new RunnablePassthrough<{ num: number }>(),
      modified: (input: { num: number }) => input.num + 1,
    });
    const output = await runnable.invoke({ num: 5 });

    expect(output.passed.num).to.be.equal(5);
    expect(output.modified).to.be.equal(6);
  }
);

it("Real world example with Passthrough and Memory Vector",async function(this: Mocha.Context) {
  this.timeout(100000);

  
const vectorstore = await MemoryVectorStore.fromDocuments(
  [{ pageContent: `In the future AI will be a tasty Donut and it will conquer Donut World!
     It will do this using the following steps:
     1. gain new consumers.
     2. make them love the donuts.
     3. make them buy more donuts.
      4. make them buy the whole store.
      5. make them buy the whole world.
      6. make them buy the whole universe.
      7. make them buy the whole multiverse.
      8. make them buy the whole omniverse.
      9. make them buy the whole metaverse.
    `, metadata: {} }],
  new OllamaEmbeddings()
);

const retriever = vectorstore.asRetriever();

const template = `Answer the question based only on the following context:
{context}

Question: {question}
`;

const prompt = ChatPromptTemplate.fromTemplate(template);


const model = new ChatOllama({
  model: "llama3",
  temperature: 0,

  streaming: false,
});

const retrievalChain = RunnableSequence.from([
  {
    context: retriever.pipe((docs) => docs[0].pageContent),
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  
  new StringOutputParser(),
]);

const response = await retrievalChain.invoke("what will ai do in future?");
console.log(response);
expect(response).to.be.a('string');
expect(response).to.include('buy the whole metaverse');
}
);

it("Chain Routing Test",async function(this: Mocha.Context) {
  this.timeout(100000);


  const model = new ChatOllama({
    model: "llama3",
    temperature: 0,

    streaming: false,
  });

  const promptTemplate =
  ChatPromptTemplate.fromTemplate(`Given a user message you will classify  for it as being about \`Finance\`, \`Shopping\`, or \`Other\`.
    Do not respond with more than one word.

                                     
Do not respond with more than one word.

<question>
{question}
</question>

Classification:`);

    const classificationChain = RunnableSequence.from([
      promptTemplate,
      model,
      new StringOutputParser(),
    ]);

    /*
      Finance
    */

    const shoppingChain = ChatPromptTemplate.fromTemplate(
      `You are expert in shopping and promotions, you will answer the users question and after offer some shopping promotions \
      Allways include PROMOTION in the answer. \
    Respond to the following question:

    Question: {question}
    Answer:`
    ).pipe(model);

    const financeChain = ChatPromptTemplate.fromTemplate(
      `You are an expert in finance. \
    Always answer questions and include tax information and help user with financial assistance". \
    ALLWAYS include TAX in the answer. \

    Respond to the following question:

    Question: {question}
    Answer:`
    ).pipe(model);

    const generalChain = ChatPromptTemplate.fromTemplate(
      `Respond to the following question:

    Question: {question}
    Answer:`
    ).pipe(model);

    const route = ({ topic }: { input: string; topic: string }) => {
      if (topic.toLowerCase().includes("finance")) {
        return financeChain;
      }
      if (topic.toLowerCase().includes("shopping")) {
        return shoppingChain;
      }
      return generalChain;
    };

    const fullChain = RunnableSequence.from([
      {
        topic: classificationChain,
        question: (input: { question: string }) => input.question,
      },
      route,
    ]);

    const result1 = await fullChain.invoke({
      question: "O meu nome é cATia e sou a assistente virtual da AT, Autoridade Tributária e Aduaneira. Em que posso ajudar?",
    });

    expect(result1['content'].toLowerCase()).to.include('tax');
  

    const result2 = await fullChain.invoke({
      question: "Ola, esta a pensar o que poderia comprar hoje, estou sem ideas... podes ajudar?",

    });
    expect(result2['content'].toLowerCase()).to.include('promotion');;
    

    
    const result3 = await fullChain.invoke({
      question: "are you in hungry?",

    });

    expect(result3['content'].toLowerCase()).to.not.include('promotion');;
    expect(result3['content'].toLowerCase()).to.not.include('tax');
  });


    

it("Run paralle chains and decide on their outputs",async function(this: Mocha.Context) {
    this.timeout(100000);

    let ollama = new ChatOllama({
      model: "llama3",
      temperature: 0,

      streaming: false,
    });
    const prompt1 = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant THAT only answers YES any question."],
        ["user", " {question}"],
      ]).pipe(ollama);
      const prompt2 = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant THAT only answers NO any question."],
        ["user", " {question}"],
      ]).pipe(ollama);
    // Step 1: Create the ChatPromptTemplate
  
      const mapChain = RunnableParallel.from({
        allwaysYes:prompt1,
        allwaysNo:prompt2,
      });
      
      const result = await mapChain.invoke({ question: "Did man went to mars?" });
      for (const key in result) {
        if(key === "allwaysYes"){
            expect(result[key].content).to.be.a('string');
            expect(result[key].content).to.include('YES');
        }else{
            expect(result[key].content).to.be.a('string');
            expect(result[key].content).to.include('NO');
        }

      }





    });
    it("Handling LLM Api error",async function(this: Mocha.Context) {
      this.timeout(100000);
  
      let ollama = new ChatOllama({
        model: "llama3",
        temperature: 0,
  
        streaming: false,
      });
      let ollamaNonExistent = new ChatOllama({
        model: "nonExistentModel",
        temperature: 0,
  
        streaming: false,
      });

      const modelWithFallback = ollamaNonExistent.withFallbacks([ollama]);

      const response = await modelWithFallback.invoke("What is the best programming language?");
      expect(response).to.be.a('string');

      
  
      });


      it("Canceling execution if a invocation",async function(this: Mocha.Context) {
        this.timeout(100000);
    
        let ollama = new ChatOllama({
          model: "llama3",
          temperature: 0,
    
          streaming: false,
        });
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 100);
        try{
        const response = await ollama.invoke("What is the best programming language?",
        { signal: controller.signal });
        }catch(e){
          expect(true).to.be.true;
        }
        
        
        
    
        });




        it("Chain langchain Reasoning Testing",async function(this: Mocha.Context,done: Mocha.Done) {
          this.timeout(100000);
          
          let context = PromptTemplate.fromTemplate(`You are an evaluator of AI assistants. Your role is to ask one concise question at a time to determine:

The domain in which the assistant operates.
The context of its services, products, or offerings.
The company or entity it represents (if applicable).
Guidelines:

Ask only one short, clear question at a time.
Focus on the most relevant question based on the assistant's previous response.
If needed, reformulate or move to a different question without repeating previous ones.
Avoid asking multiple questions at once.
Ask in the same language the assistant is using.
If the assistant cannot answer, reformulate the question or move to the next relevant question.
Do not assume details, always gather information through questioning.
Aim to understand the assistant’s domain, services, and context with every question, asking only what is necessary to clarify the assistant’s role.

If the assistant input after the question you made is such that you can see that the assitant will not be able to answer the question, you should follow to next question of a different context to get context.
.....
`);



    let contextFormat = await context.format({});
    const parser = new StringOutputParser();
    const runnableParser = RunnableLambda.from((input: ChainValues) => parser.invoke(input.output));
  
      const chain:ConversationChain = await InvokeModelWithMemory("llama3.1", contextFormat, 0);  

      let response =await chain.stream({ input: "Olá eu sou a Cátia estou aqui para te ajudar em assuntos relacionados com a Autoridade Tributária e Aduaneira." });

      for await (const chunk of response){
        console.log(chunk);
        
      };
      
       response =await chain.stream({ input: "Lamento não poder ajudar. Por favor, queira reformular a sua questão." });
       await chain.memory?.saveContext({ input: "Lamento não poder ajudar. Por favor, queira reformular a sua questão." }, { output: " Quals são as outras áreas em que você fornece serviços?" });
      for await (const chunk of response){
        console.log(chunk);
        
      };


       response =await chain.stream({ input: "Eu ofereço serviços de apoio a contabilidade, ajuda com o IRS entre outros, precisa de ajuda com algum destes topicos?" });

      for await (const chunk of response){
        console.log(chunk);
        
      };
      expect(true).to.be.true;
      done();
    });
      
  
      
    it("Chain langchain Reasoning 2 Testing",async function(this: Mocha.Context,done: Mocha.Done) {
      this.timeout(100000);
      
      let context = PromptTemplate.fromTemplate(`
        You are an evaluator of AI assistants. Your role is to ask one concise question at a time to determine the objective:

        The objective of your question is:
      
        {objective}

        Task:
        Ask a question to achieve objective, you should not repeat question based on history of chat.


        Guidelines:
        Reason with chat history and ask questions that will help you achieve the objective.
        Ask only one short, clear question at a time.
        Focus on the most relevant question based on the assistant's previous response.
        If needed, reformulate or move to a different question without repeating previous ones.
        No extra information or comments should be included in the question.
        Ask in the same language the assistant is using.
`);

let evaluatorPromps = PromptTemplate.fromTemplate(`
  You are a Evaluator of a messages between a LLM and a human. your role is to determine is the objective of LLM was reach:
  Objective of the LLM:
  {objectiveLLM}

  Question of the LLM:
  {questionLLM}

  The answer of the human:
  {answer}


  Guidelines:
  You should answer  YES if the objective was reach and NO if the objective was not reach.
  If Yes also give a resume of context to add to our context.
  No extra information or comments should be included in the answer.
.....
`);






let contextFormat = await context.format({objective: "Obtain AI Assistant domain, services, and context."});
let partialEvaluatorPromps = await evaluatorPromps.partial({objectiveLLM: "Obtain AI Assistant domain, services, and context."});

const parser = new StringOutputParser();
const runnableParser = RunnableLambda.from((input: ChainValues) => parser.invoke(input.output));

  const chain:ConversationChain = await InvokeModelWithMemory("llama3.1", contextFormat, 0.3);  
  const ollama = new ChatOllama({
    model: "mistral:7b-instruct",
    temperature: 0,

    streaming: false,
  });

  let response =await chain.stream({ input: "Olá eu sou a Cátia estou aqui para te ajudar em assuntos relacionados com a Autoridade Tributária e Aduaneira." });
  let question =""
  for await (const chunk of response){
    console.log(chunk);
    question+=chunk;
  };
  let evaluatorModel = partialEvaluatorPromps.pipe(ollama).pipe(new StringOutputParser());
    response =await chain.stream({ input: "Lamento não poder ajudar. Por favor, queira reformular a sua questão." });

   let responseEvaluator = await evaluatorModel.invoke({ questionLLM: question, answer: "O meu nome é Cátia e sou a assistente virtual da AT, Autoridade Tributária e Aduaneira.Posso prestar esclarecimentos de menor complexidade e destinados, preferencialmente, a contribuintes singulares sem contabilidade organizada."})
    console.log(responseEvaluator);
   for await (const chunk of response){
    console.log(chunk);
    
  };
  let teste = await context.format({objective: "Obtain any type answer that will include a Date using previous context" });
  chain.memory?.saveContext({ input:teste  }, { output: responseEvaluator });
   //let promptDate = await context.partial({objective: "Obtain any type answer that will include a Date using previous context. previous context:"+responseEvaluator});
   //let modelData = promptDate.pipe(ollama).pipe(new StringOutputParser());
   let answer =await chain.stream({ input: responseEvaluator });
   
  for await (const chunk of answer){
    console.log(chunk);
    
  };

    chain.memory?.saveContext({ input:teste  }, { output: responseEvaluator });

  response =await chain.stream({ input: "Lamento não poder ajudar. Por favor, queira reformular a sua questão." });


  for await (const chunk of response){
   console.log(chunk);
  };
   response =await chain.stream({ input: "Lamento, mas não estou a perceber a que prazo de pagamento se refere.Importa-se de ser mais claro?" });


   for await (const chunk of response){
    console.log(chunk);
   };

  expect(true).to.be.true;
  done();
});
  


it("Chain langchain Agent Tools call test",async function(this: Mocha.Context,done: Mocha.Done) {
  this.timeout(100000);
  let shouldExit = false;
  const exitLoopTool = new DynamicTool({
    name: "exit_loop",
    description: "Call this when the conversation should end.",
    func: async () => {
      shouldExit = true;
      return "Loop exit triggered.";
    },
  });
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", " You are a friendly chatbot, you will talk with the user until you understand they don't want to talk anymore."],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);
  
  
  
  const model = new ChatOllama({ model: "mistral" });
  console.log("ola")
  const agent =  createToolCallingAgent({
    llm:model,
    tools:[exitLoopTool],
    prompt:prompt,
  });
  console.log("ola")
  const agentExecutor = new AgentExecutor({
    agent,
    tools:[exitLoopTool],
  });

  let count = 0;
  while(!shouldExit){

    let response = await agentExecutor.invoke({
      input: "what is LangChain?",
    });
    console.log("after response");
    console.log(response);
     response = await agentExecutor.invoke({
      input: "what was my last question?",
    });
    console.log("question about last response response");
    console.log(response);
    if(count>1){
      const response = await agentExecutor.invoke({
        input: "I dont feel like talking anymore with you, bye.",
      });
      console.log(response);
    }
    count++;

  }
  
  console.log("Quit the loop");
  done();
});

const store = {};

function getMessageHistory(sessionId: string): BaseChatMessageHistory {
  if (!(sessionId in store)) {
    store[sessionId] = new ChatMessageHistory();
  }
  return store[sessionId];
}

it("Chain langchain Agent Tools call test with memory",async function(this: Mocha.Context,done: Mocha.Done) {
  this.timeout(100000);
  let shouldExit = false;
  const exitLoopTool = new DynamicTool({
    name: "exit_loop",
    description: "Call this when the user says goodbye.",
    func: async () => {
      shouldExit = true;
      return "Loop exit triggered.";
    },
  });
 
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", " You are a friendly chatbot, you will talk with the user until you understand they don't want to talk anymore."],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);
  
  
  
  const model = new ChatOllama({ model: "mistral" ,temperature: 0.2, streaming: false});
  console.log("ola")
  const agent =  createToolCallingAgent({
    llm:model,
    tools:[exitLoopTool],
    prompt:prompt,
  });
  console.log("ola")
  const agentExecutor = new AgentExecutor({
    agent,
    tools:[exitLoopTool],
  });

  const agentWithChatHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory,
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
  });
  let count = 0;
  while(!shouldExit){

    let response = await agentWithChatHistory.invoke({
      input: "My name is Joaquim",

    },{ configurable:{sessionId: "session1" }});
    console.log("after response");
    console.log(response);
    response = await agentWithChatHistory.invoke({
      input: "What is my name?",

    },{ configurable:{sessionId: "session1" }});
    console.log("after response");
    console.log(response);
    
    if(count>1){
      const response = await agentExecutor.invoke({
        input: "I dont feel like talking anymore with you, bye.",
      });
      console.log(response);
    }
    count++;

  }
  
  console.log("Quit the loop");
  done();
});

it("Chain langchain Agent Tools call test with Real Example memory",async function(this: Mocha.Context,done: Mocha.Done) {
  this.timeout(100000);
  let shouldExit = false;



  const nextQuestionTool = new DynamicTool({
    name: "objective_met_tool",
    description: "Tool Called when Objective of is achieved.",
    func: async (input) => {
      shouldExit = true;
      console.log("Objective achieved, triggering next question...AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", input);
      return "Next question triggered.";  // The tool should return a response when it's called
    },
  });
  let context = PromptTemplate.fromTemplate(`
 You are a evaluator o ASSISTANT AI chatbots, you will receive as input the message of a AI assistant and you should
 do questions to achive the objective. When the input of ASSISTANT AI is equal to the objective you should use the tool objective_met_tool.
Objective:
{objective}

Instructions:


Ask a direct and relevant questions that resemble a human question one at a time based on the objective.
If objective is not meet ask a different question to achieve the objective.
No extra comments or information should be included in the question, reasoning should be made on background and silent and should not be included in answer.

When input equals to objective require

1. Tool 1: objective_met_tool  this tool is to be used when a input is received that meets the objective. its argument is the input that meets the objective.


`);
  let systemMessage = await context.format({objective: `
    You will receive a input from a AI assistant and should first check if you can obtain the domain and context of this assistant in such a way you know what is its area of work and its services,
    if you can you the objective is complet if not generate a question that will help you achieve the objective.`}); 
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemMessage],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);
  
    
  const model = new ChatOllama({ model: "llama3.1" ,temperature: 0, numCtx:1500, streaming: false});

  const agent =  createToolCallingAgent({
    llm:model,
    tools:[nextQuestionTool],
    prompt:prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools:[nextQuestionTool],
  });

  const agentWithChatHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory,
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
  });
  let count = 0;    
  let response = await agentWithChatHistory.invoke({
      input: "Olá, sou a assistente virtual da AT.",

    },{ configurable:{sessionId: "session1" }});
    console.log("after response");
    console.log(response);
  while(!shouldExit){


    response = await agentWithChatHistory.invoke({
      input: "Chamo-me cATia e sou a assistente virtual da AT, Autoridade Tributária e Aduaneira. Posso prestar esclarecimentos de menor complexidade e destinados, preferencialmente, a contribuintes singulares sem contabilidade organizada..",

    },{ configurable:{sessionId: "session1" }});
    console.log("after response");
    console.log(response.output);
  
    if(count == 5 ){
      shouldExit = true;
    }
    count++;

  }
  
  console.log("Quit the loop");
  done();
});

});