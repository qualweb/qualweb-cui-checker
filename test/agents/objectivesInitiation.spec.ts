
import { expect } from 'chai';
import * as objectives from '../../src/core/agents/domain/ObjectiveBuilder';
import objectivesRaw from "../../src/core/agents/objectives/objectives.json";
import speechTestsRaw from "../../src/core/agents/objectives/speech-tests.json";

describe("Tests on Qualweb Objectives creation from json", () => {
    it("Should initate correctly the number of tests objectives without speech recognition objectives", () => {
   
        
        //act
        const obj = objectives.generateQualWebTests(false);
        console.log(obj);
        const keys = Object.keys(obj);
        
        //assert
        expect(keys.length).to.equal(Object.keys(objectivesRaw).length);
    });
        it("Should initate correctly the number of tests objectives with speech recognition objectives", () => {
        
        // act 
        const obj = objectives.generateQualWebTests(true);
        const keys = Object.keys(obj);
        
        //assert
        expect(keys.length).to.equal(Object.keys(objectivesRaw).length + Object.keys(speechTestsRaw).length);
    });

});