export const INPUT_TYPE = {
  GRAPH_BASE_INPUT: 'GraphBaseInput',
  GRAPH_INITIAL_INPUT: 'GraphInitialInput',
  GRAPH_RECOGNITION_INPUT: 'GraphRecognitionInput',
  GRAPH_SKIP_OBJECTIVE_INPUT: 'GraphSkipObjectiveInput',
} as const;

export interface IGraphBaseInput {
  _type: typeof INPUT_TYPE.GRAPH_BASE_INPUT;
  message: string;
}
export interface IGraphInitialInput {
  _type: typeof INPUT_TYPE.GRAPH_INITIAL_INPUT;
  message: string;
  url: string;
}
export interface IGraphRecognitionInput {
  _type: typeof INPUT_TYPE.GRAPH_RECOGNITION_INPUT;
  message: string;
  inputText: string;
}
export interface IGraphSkipObjectiveInput {
  _type: typeof INPUT_TYPE.GRAPH_SKIP_OBJECTIVE_INPUT;
}

export type TGraphInput =
  | IGraphBaseInput
  | IGraphInitialInput
  | IGraphRecognitionInput
  | IGraphSkipObjectiveInput;
