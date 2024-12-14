# CHATBOT

# Substituir bps.js por cui.js x Aguarda o desenvolvimento.

https://gemini.google.com/app?hl=en-EN

# 1. Problema na apresentação de regras ACT  (a fazer debug)  Resolvido

2. Tentar obter input field a partir do LLM  (em analise)  
(Experimentar modelos locais)
Tentar obter input field para o microfone a partir do LLM (Caso não exista obter n/a)
        Analise feita com o model Mistral em Ollama identificou com sucesso os elementos de elementos selecionados e de tamanho limitado.
        Existem outros modelos como codellama e outros mas é necessário comutadores com uma memoria ram elevada.        
        Iniciada a criação de um Modelfile para construir o contexto do chatbot e descrever a template esperada.

# 3. Colocar Input de voice a funcionar.
# Colocar a parte do tts a funcionar com a API do chrome.
#    Adicionar o request lido pelo microphone a array the requests associados a sua response.  (feito, falta testar)
#    Falta adicionar casos exepcionais, como em caso de falha ou um modo de cancelar o mesmo processo de teste em voice inpit
 Melhorar 

4. Dar a pagina inteira ao LLM para identificação do chatbot
    Problema - ChatGpt não aceita prompts longas como o input inteiro de uma pagina HTML complexa
               Provavelment um LLM local não irá processar de maneira eficiente uma prompt bastante longa
    Opt 1: Criar um servidor api Flask o qual recebe o pedido, processa e simplifica o html removendo  com o beautify soup
           constroi o pedido e faz o pedido ao Ollama local, depois devolve o pedido.

            Pros - 
            adicionado um nivel de abstração , sendo só necessário fazer um pedido com o html completo sem qualquer prompt necessário no lado do cliente.

            Processamento do HTML mais rapido em beautify soup do que em javascript dom.

            Cons - 
            Nivel de complexidade adicionada
            Necessário fazer um algoritmo para simplificar o html sem remover elementos necessários à identificação.
    
    Extra - existe também a possibilidade de adicionar uma nova heuristica relacionada com os lugares comuns de um chatbot, no meio do ecrã ou em um dos cantos


5. Ligar extension aos endpoints do 
    Primeiro teste, botão para testar LLM element Xpath identification para zonas clicadas.


6. Enviar mensagens apos input voice e verificar em outros chatbots
    Sistema a enviar mensagem apos input voice

     