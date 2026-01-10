import { expect } from 'chai';

import QWBrowserTest  from "../../src/core/agents//domain/QWTests/QWBrowserTest";
import QWRecognitionTest from "../../src/core/agents/domain/QWTests/QWRecognitionTest";
import  QWStandardTest  from "../../src/core/agents/domain/QWTests/QWStandardTest";

import TestRegistry from "../../src/core/agents/domain/QWTests/TestRegistry";
import InputRegistry from '../../src/core/agents/domain/GraphInput/InputRegistry';
import { MockRawBrowserTestData, MockRawRecognitionTestData,MockRawQWBrowserTestData , MockRawQWStandardTestData,MockSetBrowserTestOutcomeAction, MockRecognitionInputData, MockBasicInputData, MockInitialInputData, MockPlaySoundAction, MockQuestionAction, MockMarkElementAction, MockQWGraphOutput} from "./Mocks";
import { TEST_OUTCOME, TypeTestOutcome } from '../../src/core/agents/domain/QWTests/browser-tests/BrowserTest';
import GraphRecognitionInput from '../../src/core/agents/domain/GraphInput/GraphRecognitionInput';
import GraphBaseInput from '../../src/core/agents/domain/GraphInput/GraphBaseInput';
import GraphInitialInput from '../../src/core/agents/domain/GraphInput/GraphInitialInput';
import { TestConditions } from '../../src/core/agents/domain/QWTests/types';
import { ObjectiveSerialized } from '../../src/core/agents/domain/ObjectiveBuilder';
import ActionRegistry from '../../src/core/agents/domain/GraphOutput/actions/ActionRegistry';
import PlaySoundAction from '../../src/core/agents/domain/GraphOutput/actions/PlaySoundAction';
import QuestionAction from '../../src/core/agents/domain/GraphOutput/actions/QuestionAction';
import MarkElementAction from '../../src/core/agents/domain/GraphOutput/actions/MarkElementAction';
import SetBrowserTestOutcomeAction from '../../src/core/agents/domain/GraphOutput/actions/SetBrowserTestOutcome';

describe("Serialization tests", () => {
describe("Tests on Qualweb Tests Serialization and Deserialization", () => {
  


    it("should serialize QWBrowserTest to JSON with all properties", () => {
        // prepare 
        const expectedJSON = MockRawQWBrowserTestData
        //act
        const test = new QWBrowserTest(
            MockRawQWBrowserTestData.check,
            MockRawQWBrowserTestData.title,
            MockRawQWBrowserTestData.selector,
            MockRawQWBrowserTestData.objective,
            MockRawQWBrowserTestData.requirements,
            MockRawQWBrowserTestData.exceptions,
            {
                pass: MockRawBrowserTestData.conditions.pass,
                fail: MockRawBrowserTestData.conditions.fail,
                warn: MockRawBrowserTestData.conditions.warn,
                inapplicable: MockRawBrowserTestData.conditions.inapplicable,
            },
            MockRawBrowserTestData.outcome as unknown as TypeTestOutcome
        );
        test.getTest().setChatbotResponse(MockRawBrowserTestData.chatbotResponse as string);
        const json = test.toJSON() as any;
        //assert

        expect(json).to.deep.equal(expectedJSON);

    });
    it("should serialize QWRecognitionTest to JSON with all properties", () => {
        const expectedJSON = MockRawRecognitionTestData;
        const test = new QWRecognitionTest(
            MockRawRecognitionTestData.check,
            MockRawRecognitionTestData.title,
            MockRawRecognitionTestData.selector,
            MockRawRecognitionTestData.test.conditions as TestConditions,
            MockRawRecognitionTestData.test.transcript,
            MockRawRecognitionTestData.test.expectedResponse,
            MockRawRecognitionTestData.test.locale,
            MockRawRecognitionTestData.test.audioFilename, 
        );
        test.getTest().setOutcome(TEST_OUTCOME.PASSED);
        test.getTest().setChatbotResponse(MockRawBrowserTestData.chatbotResponse);
        const json = test.toJSON() as any;

        expect(json).to.deep.equal(expectedJSON);
    });

    it("should serialize QWStandardTest to JSON with all properties", () => {
        const expectedJSON = MockRawQWStandardTestData;
        const test = new QWStandardTest(
            MockRawQWStandardTestData.check,
            MockRawQWStandardTestData.title,
            MockRawQWStandardTestData.selector,
            MockRawQWStandardTestData.objective,
            MockRawQWStandardTestData.requirements,
            MockRawQWStandardTestData.exceptions,
         
        );
        const json = test.toJSON() as any;

        expect(json).to.deep.equal(expectedJSON);
   });

   it("should deserialize QWBrowserTest from JSON with all properties", () => {
        const test: QWBrowserTest = TestRegistry.deserialize(MockRawQWBrowserTestData) as QWBrowserTest;
        expect(test.getCheck()).to.equal(MockRawQWBrowserTestData.check);
        expect(test.getTitle()).to.equal(MockRawQWBrowserTestData.title);
        expect(test.getObjective()).to.equal(MockRawQWBrowserTestData.objective);
        expect(test.getTest().getChatbotResponse()).to.equal(MockRawQWBrowserTestData.test.chatbotResponse);
        expect(test.getRequirements()).to.equal(MockRawQWBrowserTestData.requirements);
        expect(test.getExceptions()).to.equal(MockRawQWBrowserTestData.exceptions);
        expect(test.getTest().getConditions()).to.deep.equal(MockRawQWBrowserTestData.test.conditions);
        expect(test.getTest().getOutcome()).to.equal(MockRawQWBrowserTestData.test.outcome);
   });
    it("should deserialize QWRecognitionTest from JSON with all properties", () => {
        const test: QWRecognitionTest = TestRegistry.deserialize(MockRawRecognitionTestData) as QWRecognitionTest;
        expect(test.getCheck()).to.equal(MockRawRecognitionTestData.check);
        expect(test.getTitle()).to.equal(MockRawRecognitionTestData.title);
        expect(test.getTest().getConditions()).to.deep.equal(MockRawRecognitionTestData.test.conditions);
        expect(test.getTest().getTranscript()).to.equal(MockRawRecognitionTestData.test.transcript);
        expect(test.getTest().getExpectedResponse()).to.equal(MockRawRecognitionTestData.test.expectedResponse);
        expect(test.getTest().getChatbotResponse()).to.equal(MockRawRecognitionTestData.test.chatbotResponse);
        expect(test.getTest().getLocale()).to.equal(MockRawRecognitionTestData.test.locale);
        expect(test.getTest().getAudioFilename()).to.equal(MockRawRecognitionTestData.test.audioFilename);
        expect(test.getTest().getOutcome()).to.equal(MockRawRecognitionTestData.test.outcome);
   });
   it("should deserialize QWStandardTest from JSON with all properties", () => {
        const test: QWStandardTest = TestRegistry.deserialize(MockRawQWStandardTestData) as QWStandardTest;
        expect(test.getCheck()).to.equal(MockRawQWStandardTestData.check);
        expect(test.getTitle()).to.equal(MockRawQWStandardTestData.title);
        expect(test.getObjective()).to.equal(MockRawQWStandardTestData.objective);
        expect(test.getRequirements()).to.equal(MockRawQWStandardTestData.requirements);
        expect(test.getExceptions()).to.equal(MockRawQWStandardTestData.exceptions);
   });

   it("should throw error when deserializing unknown test type", () => {
    const invalidTestData = {
        _type: "UnknownTestType",
        check: "some_check",
        title: "Some Title",
        selector: "#some-selector",

    };
    expect(() => TestRegistry.deserialize(invalidTestData as ObjectiveSerialized)).to.throw();
   });

   it("should throw error when deserializing with missing _type", () => {
    const invalidTestData = {
    
        check: "some_check",
        title: "Some Title",
        selector: "#some-selector",
    };
    expect(() => TestRegistry.deserialize(invalidTestData as ObjectiveSerialized)).to.throw();
   });

});
describe("Tests on Graph Input Objects Tests Serialization and Deserialization", () => {
    it("should serialize GraphBaseInput to JSON with all properties", () => {
        const expectedJSON =  MockBasicInputData;
        const input = new GraphBaseInput(
            MockBasicInputData.message,
        );
        const json = input.toJSON() as any;
        expect(json).to.deep.equal(expectedJSON);
    });
    it ("should deserialize GraphBaseInput from JSON with all properties", () => {
        const mockGraphBaseInputData =  MockBasicInputData;
        const input = InputRegistry.deserialize(mockGraphBaseInputData) as GraphBaseInput;

        expect(input.getMessage()).to.equal(mockGraphBaseInputData.message);
    });

    it("should serialize GraphInitialInput to JSON with all properties", () => {
        const expectedJSON =  MockInitialInputData;
        const input = new GraphInitialInput(
            MockInitialInputData.message,
            MockInitialInputData.url
        );
        const json = input.toJSON() as any;
  
        expect(json).to.deep.equal(expectedJSON);   
    });
    it("should deserialize GraphInitialInput from JSON with all properties", () => {
        const  mockGraphInitialInputData =  MockInitialInputData;
        const input = InputRegistry.deserialize( mockGraphInitialInputData) as GraphInitialInput;

        expect(input.getMessage()).to.equal( mockGraphInitialInputData.message);
        expect(input.getUrl()).to.equal( mockGraphInitialInputData.url);
    });
    it("should serialize GraphRecognitionInput to JSON with all properties", () => {
        const expectedJSON =  MockRecognitionInputData;
        const input = new GraphRecognitionInput(
            MockRecognitionInputData.message,
            MockRecognitionInputData.inputText
        );
        const json = input.toJSON() as any;
        console.log(JSON.stringify(json, null, 2));
        console.log(JSON.stringify(expectedJSON, null, 2));
        expect(json).to.deep.equal(expectedJSON);
    });

    it("should deserialize GraphRecognitionInput from JSON with all properties", () => {
        const mockGraphRecognitionInputData =  MockRecognitionInputData;
        const input = InputRegistry.deserialize(mockGraphRecognitionInputData) as GraphRecognitionInput;

        expect(input.getMessage()).to.equal(mockGraphRecognitionInputData.message);
        expect(input.getInputText()).to.equal(mockGraphRecognitionInputData.inputText);

    });
});

describe("Tests on GraphOutput Action objects Tests Serialization and Deserialization", () => {
    it("should serialize PlaySoundAction to JSON with all properties", () => {
        const expectedJSON = MockPlaySoundAction;
        const action = ActionRegistry.deserialize(MockPlaySoundAction);
        const json = action.toJSON() as any;
        
        expect(json).to.deep.equal(expectedJSON);
    });

    it("should deserialize PlaySoundAction from JSON with all properties", () => {
        const action = ActionRegistry.deserialize(MockPlaySoundAction) as PlaySoundAction;
        
        expect(action.getAudioFilename()).to.equal(MockPlaySoundAction.audioFilename);
    });

    it("should serialize QuestionAction to JSON with all properties", () => {
        const expectedJSON = MockQuestionAction;
        const action = ActionRegistry.deserialize(MockQuestionAction);
        const json = action.toJSON() as any;
        
        expect(json).to.deep.equal(expectedJSON);
    });

    it("should deserialize QuestionAction from JSON with all properties", () => {
        const action = ActionRegistry.deserialize(MockQuestionAction) as QuestionAction;
        
        expect(action.getQuestion()).to.equal(MockQuestionAction.question);
    });

    it("should serialize MarkElementAction to JSON with all properties", () => {
        const expectedJSON = MockMarkElementAction;
        const action = ActionRegistry.deserialize(MockMarkElementAction) as MarkElementAction;
        const json = action.toJSON() as any;
        
        expect(json).to.deep.equal(expectedJSON);
    });

    it("should deserialize MarkElementAction from JSON with all properties", () => {
        const action = ActionRegistry.deserialize(MockMarkElementAction) as MarkElementAction;
        
        expect(action.getSelector()).to.equal(MockMarkElementAction.selector);
        expect(action.getCheck()).to.equal(MockMarkElementAction.check);
    });

    it("should deserialize SetBrowserTestOutcomeAction from JSON with all properties", () => {
        const mockSetBrowserTestOutcomeAction =MockSetBrowserTestOutcomeAction;

        const action = ActionRegistry.deserialize(mockSetBrowserTestOutcomeAction);
        
        expect(action).to.be.instanceOf(SetBrowserTestOutcomeAction);
        expect((action as SetBrowserTestOutcomeAction).getSelector()).to.equal(mockSetBrowserTestOutcomeAction.selector);
    });

    it("should serialize QWGraphOutput to JSON with all properties", () => {
        const expectedJSON = MockQWGraphOutput;
        const output = ActionRegistry.deserializeArray(MockQWGraphOutput.actions);
        const json = {
            status: MockQWGraphOutput.status,
            actions: output.map(action => action.toJSON()),
        };
        expect(json).to.deep.equal(expectedJSON);
    });

 
});
});