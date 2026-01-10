import { StatusGraph, StatusTest } from "../../src/core/agents/domain/types";
import { ACTION_TYPE } from "../../src/core/agents/domain/GraphOutput/types";
import { INPUT_TYPE } from "../../src/core/agents/domain/GraphInput/types";
import { BROWSER_TEST_TYPE, TEST_TYPE } from "../../src/core/agents/domain/QWTests/types";
import { TypeTestOutcome } from "../../src/core/agents/domain/QWTests/browser-tests/BrowserTest";
export const MockRawObjectiveStatusData = {
  counterExecution: 0,
  status: "not_started" as StatusTest, 
};

export const MockRawTestOutcomeData = {
  outcome: "passed",
};

export const MockTestConditions = {
  pass: "Mock pass condition",
  fail: "Mock fail condition",
  warn: "Mock warn condition",
  inapplicable: "Mock inapplicable condition",
};

export const MockRawBrowserTestData = {
  _type: BROWSER_TEST_TYPE.BROWSER_TEST,
  conditions: MockTestConditions,
  outcome: "passed",
  chatbotResponse: "Mock chatbot response",
};


export const MockRawQWTestData = {
  _type: TEST_TYPE.QW_TEST,
  check: "mock_check",
  selector: "#mock-selector",
  title: "Mock QW Browser Test",
  ...MockRawObjectiveStatusData
};
export const MockRawRecognitionTestData = {
    ...MockRawQWTestData,
  _type: TEST_TYPE.QW_RECOGNITION_TEST,
  test: {
    _type:  BROWSER_TEST_TYPE.RECOGNITION_BROWSER_TEST,
    conditions: MockTestConditions,
  transcript: "Mock Transcript",
  expectedResponse: "Mock Expected Response",
  locale: "en-US",
  audioFilename: "mock_audio.wav",
  chatbotResponse: "Mock chatbot response",

  ...MockRawTestOutcomeData
  }
};

export const MockRawQWStandardTestData = {
        ...MockRawQWTestData,
        _type: TEST_TYPE.QW_STANDARD_TEST,
        objective: "Mock Objective",
        requirements: "Mock Requirements",
        exceptions: "Mock Exceptions",
};

export const MockRawQWSpeechRecognitionTestData = {
    ...MockRawQWTestData,
    _type: TEST_TYPE.QW_RECOGNITION_TEST,
    test: MockRawRecognitionTestData,
};

export const MockRawQWBrowserTestData = {
    ...MockRawQWStandardTestData,
    _type: TEST_TYPE.QW_BROWSER_TEST,
    test: MockRawBrowserTestData,
};


export const MockBasicInputData = {
  _type: INPUT_TYPE.GRAPH_BASE_INPUT,
  message: "Mock basic input message",
};

export const MockInitialInputData = {
  ...MockBasicInputData,
  _type: INPUT_TYPE.GRAPH_INITIAL_INPUT,
  url: "https://mockurl.com",
};

export const MockRecognitionInputData = {
  ...MockBasicInputData,
  _type: INPUT_TYPE.GRAPH_RECOGNITION_INPUT,
  inputText: "Mock recognition input text",
};





export const MockPlaySoundAction = {
  _type: ACTION_TYPE.PLAY_SOUND_ACTION,
  audioFilename: "mock_audio.wav",
};

export const MockQuestionAction = {
  _type: ACTION_TYPE.QUESTION_ACTION,
  question: "Mock question?",
};

export const MockMarkElementAction = {
  _type: ACTION_TYPE.MARK_ELEMENT_ACTION,
  selector: "#mock-selector",
  check: "mock_check",
};
export const MockSetBrowserTestOutcomeAction = {
            _type: ACTION_TYPE.SET_BROWSER_TEST_OUTCOME_ACTION,
            check: "test-check",
            selector: "#test-selector",
            outcome: "passed" as TypeTestOutcome,
};

export const MockQWGraphOutput = {
  status: "in_progress" as StatusGraph,
  actions: [
    MockPlaySoundAction,
    MockQuestionAction,
    MockMarkElementAction,
    MockSetBrowserTestOutcomeAction
  ],
};