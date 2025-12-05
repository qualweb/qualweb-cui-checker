# Qualweb CUI Checker

Browser extension for evaluating the accessibility of Conversational User Interfaces (CUI).  

---
## Table of Contents
- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](technologies)
- [Funding](#funding)
---

## Description
**Qualweb CUI Checker** is a Chrome browser extension that interacts with AI assistants by generating context-aware questions and analyzing their responses to evaluate the assistant’s accessibility. It also detects the assistant’s interface, enabling interaction and evaluation of chatbot answers, as well as performing additional tests based on ACT, WCAG, and CUI guidelines.
## Installation

1. Clone the repository:
  ```bash
  git clone git@github.com:qualweb/qualweb-cui-checker.git
  ```
2. Install Node.js:
  -If you have nvm installed, you can install and use Node.js version 20.18.1 with:
 ```bash
 nvm install 20.18.1
 nvm use 20.18.1
 ```
  - Otherwise install Node 20.18.1
    
3. Install dependencies:
  ```bash
  npm install
  ```

4. Build production folder:
 ```bash
 npm run build-prod
 ```
5. Open `chrome://extensions/` in Chrome, enable **Developer Mode**, click on **Load unpacked**, then navigate to and select the `dist` folder inside the project directory to load the extension.

## Usage
1. Install the extension from the Chrome Web Store, or install it manually by cloning the repository as described in the Installation section.
2. Configure the extension settings and define the AI service and API key.
3. Open the page of the AI assistant you want to evaluate.
3. Open the Chrome extension by clicking its action icon.
4. Open the chat interface of the AI assistant you want to evaluate.
5. In the extension, press the "Detect Chatbot" button to start the detection.
6. The extension will prompt you to confirm each detected chatbot interface element one by one.  
   - If you confirm the element is correct, the process moves on to the next element.  
   - If you indicate it is incorrect, the extension will retry detecting that specific element before moving forward.
   - You can choose to cancel detection.
7. Choose the type of evaluation you want to run by selecting the corresponding checkboxes. Available options include:  
   - ACT  
   - WCAG
   - CUI

8. Before running the CUI evaluation, you must first run the Interaction phase to generate chatbot responses for assessment.

9. Because Large Language Models (LLMs) behave non-deterministically, some objectives might not be met despite repeated attempts. After three tries, the system will proceed to the next objective.

10. Once the Interaction phase is complete, you can proceed to run the CUI evaluation checks.

12. After the evaluation is complete, you can view a detailed report of the results within the extension.  
    - By clicking on any tested rule, you will get more information about the test and its target.
      
13. You can download the evaluation report in PDF or CSV format for further analysis or record-keeping.

## Technologies
- TypeScript  
- JavaScript
- Vue
- Chrome Extension Manifest V3  
- LangChain JS and LangGraph JS  

## Funding
This work is being funded by the PRR through the Accelerat.AI project. 

![Funding logos](logos_59d97e2b6c.png)
