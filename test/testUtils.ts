import { JSDOM } from "jsdom";
import xpath from "xpath";
import { DOMParser } from "xmldom";

export function setupJSDOMWithXPath(dom: JSDOM) {
  const document = dom.window.document;
  
  // Adicionar XPathResult
  (dom.window as any).XPathResult = {
    ANY_TYPE: 0,
    NUMBER_TYPE: 1,
    STRING_TYPE: 2,
    BOOLEAN_TYPE: 3,
    UNORDERED_NODE_ITERATOR_TYPE: 4,
    ORDERED_NODE_ITERATOR_TYPE: 5,
    UNORDERED_NODE_SNAPSHOT_TYPE: 6,
    ORDERED_NODE_SNAPSHOT_TYPE: 7,
    ANY_UNORDERED_NODE_TYPE: 8,
    FIRST_ORDERED_NODE_TYPE: 9,
  };

  // Polyfill para document.evaluate
  document.evaluate = function(
    expression: string,
    contextNode: Node,
    namespaceResolver: XPathNSResolver | null,
    resultType: number,
    result: XPathResult | null
  ): XPathResult {
    const serializer = new dom.window.XMLSerializer();
    const xmlString = serializer.serializeToString(contextNode as any);
    const xmlDoc = new DOMParser().parseFromString(xmlString, "text/xml");
    const nodes = xpath.select(expression, xmlDoc);
    const nodeArray = Array.isArray(nodes) ? nodes : [nodes];
    
    return {
      resultType,
      numberValue: NaN,
      stringValue: "",
      booleanValue: nodeArray.length > 0,
      singleNodeValue: nodeArray.length > 0 ? (nodeArray[0] as any) : null,
      invalidIteratorState: false,
      snapshotLength: nodeArray.length,
      iterateNext: () => null,
      snapshotItem: (index: number) => nodeArray[index] || null,
    } as XPathResult;
  };
  
  return document;
}