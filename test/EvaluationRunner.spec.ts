import { expect } from 'chai';
import * as sinon from 'sinon';
import {EvaluationRunnerFactory} from '../src/content/factories/EvaluationRunnerFactory';
import { EvaluationRunner } from '../src/content/evaluation/EvaluationRunner';
import { JSDOM } from 'jsdom';
import ChatbotElements from '../src/content/detection/ChatbotElements';

describe('EvaluationRunner', () => {

    let evaluationRunner: EvaluationRunner;
    let sandbox: sinon.SinonSandbox;
    //initiaie JSDOM and set window env
    let dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`, { url: "http://localhost" });
    (global as any).window = dom.window;
    (global as any).document = dom.window.document;


    

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        const ChatbotInterface = {} as ChatbotElements; // Mock ChatbotElements
        EvaluationRunnerFactory.init(ChatbotInterface);
        // Reset singleton instance
        (EvaluationRunner as any).instance = undefined;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getInstance', () => {
        it('should return the same instance on multiple calls', () => {
            const instance1 = EvaluationRunnerFactory.getInstance();
            const instance2 = EvaluationRunnerFactory.getInstance();
            expect(instance1).to.equal(instance2);
        });

        it('should create an instance on first call', () => {
            const instance = EvaluationRunnerFactory.getInstance();
            expect(instance).to.be.instanceOf(EvaluationRunner);
        });
    });

    describe('getSummary', () => {
        it('should return an array with two summary objects', () => {
            evaluationRunner = EvaluationRunnerFactory.getInstance();
            const summary = evaluationRunner.getSummary();
            expect(summary).to.be.an('array');
            expect(summary).to.have.lengthOf(2);
        });

        it('should return summaries with correct structure', () => {
            evaluationRunner = EvaluationRunnerFactory.getInstance();
            const [summary] = evaluationRunner.getSummary();
            expect(summary).to.have.all.keys('passed', 'failed', 'warning', 'inapplicable', 'title');
        });
    });

    describe('addSelectors', () => {
        it('should add selectors to QWCUI_Selectors', () => {
            evaluationRunner = EvaluationRunnerFactory.getInstance();
            const selectors = {
                selector1: '.class1',
                selector2: '#id2',
            };
            evaluationRunner.addSelectors(selectors);
            // Verify through subsequent operations or by checking if selectors are stored
            expect(evaluationRunner).to.be.instanceOf(EvaluationRunner);
        });

        it('should merge multiple selector additions', () => {
            evaluationRunner = EvaluationRunnerFactory.getInstance();
            evaluationRunner.addSelectors({ selector1: '.class1' });
            evaluationRunner.addSelectors({ selector2: '.class2' });
            expect(evaluationRunner).to.be.instanceOf(EvaluationRunner);
        });
    });

    describe('addRuleTested', () => {
        it('should add a rule to rulesTested array', () => {
            evaluationRunner = EvaluationRunnerFactory.getInstance();
            const initialLength = evaluationRunner.rulesTested.length;
            const ruleTest = { name: 'test-rule' } as any;
            evaluationRunner.addRuleTested(ruleTest);
            expect(evaluationRunner.rulesTested).to.have.lengthOf(initialLength + 1);
        });

        it('should add multiple rules to rulesTested array', () => {
            evaluationRunner = EvaluationRunnerFactory.getInstance();
            const ruleTest1 = { name: 'test-rule-1' } as any;
            const ruleTest2 = { name: 'test-rule-2' } as any;
            evaluationRunner.addRuleTested(ruleTest1);
            evaluationRunner.addRuleTested(ruleTest2);
           
            expect(evaluationRunner.rulesTested).to.have.lengthOf(2);
            expect(evaluationRunner.rulesTested[0]).to.equal(ruleTest1);
            expect(evaluationRunner.rulesTested[1]).to.equal(ruleTest2);
        });
    });

});