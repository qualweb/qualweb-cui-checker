import { IGraphInitialInput, IGraphBaseInput, TGraphInput, IGraphRecognitionInput, INPUT_TYPE } from "./types";

import GraphBaseInput from "./GraphBaseInput";
import GraphInitialInput from "./GraphInitialInput";
import GraphRecognitionInput from "./GraphRecognitionInput";

export type GraphInputType = GraphBaseInput | GraphRecognitionInput | GraphInitialInput ;

type DeserializerFn = (data: TGraphInput ) => GraphInputType;

class InputRegistry {
  private static  readonly deserializers = new Map<string, DeserializerFn>();

  /**
   * Register a deserializer for a Input type
   */
  static register(type: string, deserializer: DeserializerFn): void {
    this.deserializers.set(type, deserializer);
  }

  /**
   * Deserialize a single Input object
   */
  static deserialize(data: TGraphInput): GraphInputType {
    const deserializer = this.deserializers.get(data._type);
    
    if (!deserializer) {
      throw new Error(
        `No deserializer registered for type: ${data._type}. ` +
        `Available types: ${Array.from(this.deserializers.keys()).join(', ')}`
      );
    }
    
    const instance = deserializer(data);
    
    
    return instance;
  }

  /**
   * Deserialize from JSON string
   */
  static fromJSON(json: string): GraphInputType {
    const data = JSON.parse(json);
    return this.deserialize(data);
  }


  /**
   * Get all registered types
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.deserializers.keys());
  }

  /**
   * Check if a type is registered
   */
  static isRegistered(type: string): boolean {
    return this.deserializers.has(type);
  }
}

export default InputRegistry;

// Register default deserializers
InputRegistry.register(INPUT_TYPE.GRAPH_BASE_INPUT, (data: TGraphInput) => {
  const typedData = data as IGraphBaseInput;
   const instance = new GraphBaseInput(
    typedData.message
  );
  return instance;
});

InputRegistry.register(INPUT_TYPE.GRAPH_INITIAL_INPUT, (data: TGraphInput) => {
  const typedData = data as IGraphInitialInput;
  const instance = new GraphInitialInput(
    typedData.message,
    typedData.url
  );
    return instance;
});

InputRegistry.register(INPUT_TYPE.GRAPH_RECOGNITION_INPUT, (data: TGraphInput) => {
  const typedData = data as IGraphRecognitionInput;

  const instance = new GraphRecognitionInput(
    typedData.message,
    typedData.inputText
  );
 
  return instance;
});