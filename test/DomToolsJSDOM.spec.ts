import { JSDOM } from "jsdom";
import { makeChatSectionsDynamic } from "./html-cases/DynamicChatGenerator";
import { expect } from "chai";
import {it} from "mocha";
import { containsExactTextXPath } from '../src/content/lib/XPathTools';
describe("DomTools XPath functions", () => {
  let dom: JSDOM;
  let document: Document;
  

  it("should detect text in node", () => {
     const html = makeChatSectionsDynamic({
       assistant: {
    text: "Olá, em que posso ajudar?",
    attributes: {
      "data-visible": "true",
      "aria-label": "Assistente",
    },
  },
  user: {
    text: "Tudo bem por aqui!",
    attributes: {
      "class": "chat-thread",
    },
  }});
  
    dom = new JSDOM(html);
    (global as any).XPathResult = dom.window.XPathResult;
    document = dom.window.document;
    let container = document.getElementById("root") as HTMLElement;
    const result = containsExactTextXPath(container, "Olá, em que posso ajudar?");
    expect(result).equal(true);
  });
   
  it("should detect text with special chars in node", () => {
    const testToFind = `Special chars:  ' " ''' """ \ '" & < > / \\`;
      const html = makeChatSectionsDynamic({
       assistant: {
    text: testToFind,
    attributes: {
      "data-visible": "true",
      "aria-label": "Assistent",
    },
  },
  user: {
    text: "Tudo bem por aqui!",
    attributes: {
      "class": "chat-thread",
    },
  }});
  
    dom = new JSDOM(html);
    (global as any).XPathResult = dom.window.XPathResult;
    document = dom.window.document;
    let container = document.getElementById("root") as HTMLElement;
    const result = containsExactTextXPath(container, testToFind);
    expect(result).equal(true);
  });

    it("should fail detecting not present text", () => {
    const testToFind = `Text not present`;
      const html = makeChatSectionsDynamic({
       assistant: {
    text: "Hello, how can I help you?",
    attributes: {
      "data-visible": "true",
      "aria-label": "Assistant",
    },
  },
  user: {
    text: "Tudo bem por aqui!",
    attributes: {
      "class": "chat-thread",
    },
  }});
  
    dom = new JSDOM(html);
    (global as any).XPathResult = dom.window.XPathResult;
    document = dom.window.document;
    let container = document.getElementById("root") as HTMLElement;
    const result = containsExactTextXPath(container, testToFind);
    expect(result).equal(false);
  });

  it("should detect text with quotes in node", () => {
    const testToFind = `It's a test with 'single' and "double" quotes`;
      const html = makeChatSectionsDynamic({
       assistant: {
    text: testToFind,
    attributes: {
      "data-visible": "true",
      "aria-label": "Assistant",
    },
  },
  user: {
    text: "Tudo bem por aqui!",
    attributes: {
      "class": "chat-thread",
    },
  }});
  
    dom = new JSDOM(html);
    (global as any).XPathResult = dom.window.XPathResult;
    document = dom.window.document;
    let container = document.getElementById("root") as HTMLElement;
    const result = containsExactTextXPath(container, testToFind);
    expect(result).equal(true);
  });

  it("it should fail when provided with empty string for detecting text", () => {
      const html = makeChatSectionsDynamic({
       assistant: {
    text: "Hello, how can I help you?",
    attributes: {
      "data-visible": "true",
      "aria-label": "Assistant",
    },
  },
  user: {
    text: "Tudo bem por aqui!",
    attributes: {
      "class": "chat-thread",
    },
  }});
  
    dom = new JSDOM(html);
    (global as any).XPathResult = dom.window.XPathResult;
    document = dom.window.document;
    let container = document.getElementById("root") as HTMLElement;
    expect(() => containsExactTextXPath(container, '')).to.throw();
  });

  it("should Throw Error when provided undefined string for detecting text", () => {
      const html = makeChatSectionsDynamic({
       assistant: {
    text: "Hello, how can I help you?",
    attributes: {
      "data-visible": "true",
      "aria-label": "Assistant",
    },
  },
  user: {
    text: "Tudo bem por aqui!",
    attributes: {
      "class": "chat-thread",
    },
  }});
  
    dom = new JSDOM(html);
    (global as any).XPathResult = dom.window.XPathResult;
    document = dom.window.document;
    let container = document.getElementById("root") as HTMLElement;
    expect(() => containsExactTextXPath(container, undefined as any)).to.throw();


  });

    it("should Throw Error when provided undefined container for detecting text", () => {
      const testToFind = `Hello World`;
      const html = makeChatSectionsDynamic({
       assistant: {
    text: testToFind,
    attributes: {
      "data-visible": "true",
      "aria-label": "Assistant",
    },
  
  }});
  
    dom = new JSDOM(html);
    (global as any).XPathResult = dom.window.XPathResult;
    document = dom.window.document;

    expect(() => containsExactTextXPath(undefined as any, testToFind)).to.throw();


  });

});