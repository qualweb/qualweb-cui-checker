import { ChainValues } from '@langchain/core/utils/types';
import { invokeDirectMessageOllama,InvokeModelWithMemory } from '../src/langchain/langchain';
import { expect, } from 'chai';
import { doesNotMatch ,} from 'assert';

describe('connectOllama', ()  => {
        it('should return the completion response from Ollama', async function(this: Mocha.Context) {
            this.timeout(10000);
            const result = await invokeDirectMessageOllama("mistral:7b-instruct", "Hello", 0);
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
        expect(response).to.be.a('string');
        
        
    });
    
});