import { expect } from 'chai';
import * as sinon from 'sinon';
import { EvaluationRunner } from '../src/content/evaluation/EvaluationRunner';
import { JSDOM } from 'jsdom';

describe('EvaluationRunner', () => {

    let evaluationRunner: EvaluationRunner;
    let sandbox: sinon.SinonSandbox;
    //initiaie JSDOM and set window env
    let dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`, { url: "http://localhost" });
    (global as any).window = dom.window;
    (global as any).document = dom.window.document;


    

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Reset singleton instance
        (EvaluationRunner as any).instance = undefined;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getInstance', () => {
        it('should return the same instance on multiple calls', () => {
            const instance1 = EvaluationRunner.getInstance();
            const instance2 = EvaluationRunner.getInstance();
            expect(instance1).to.equal(instance2);
        });

        it('should create an instance on first call', () => {
            const instance = EvaluationRunner.getInstance();
            expect(instance).to.be.instanceOf(EvaluationRunner);
        });
    });

    describe('getSummary', () => {
        it('should return an array with two summary objects', () => {
            evaluationRunner = EvaluationRunner.getInstance();
            const summary = evaluationRunner.getSummary();
            expect(summary).to.be.an('array');
            expect(summary).to.have.lengthOf(2);
        });

        it('should return summaries with correct structure', () => {
            evaluationRunner = EvaluationRunner.getInstance();
            const [summary] = evaluationRunner.getSummary();
            expect(summary).to.have.all.keys('passed', 'failed', 'warning', 'inapplicable', 'title');
        });
    });

    describe('addSelectors', () => {
        it('should add selectors to QWCUI_Selectors', () => {
            evaluationRunner = EvaluationRunner.getInstance();
            const selectors = {
                selector1: '.class1',
                selector2: '#id2',
            };
            evaluationRunner.addSelectors(selectors);
            // Verify through subsequent operations or by checking if selectors are stored
            expect(evaluationRunner).to.be.instanceOf(EvaluationRunner);
        });

        it('should merge multiple selector additions', () => {
            evaluationRunner = EvaluationRunner.getInstance();
            evaluationRunner.addSelectors({ selector1: '.class1' });
            evaluationRunner.addSelectors({ selector2: '.class2' });
            expect(evaluationRunner).to.be.instanceOf(EvaluationRunner);
        });
    });

    describe('addRuleTested', () => {
        it('should add a rule to rulesTested array', () => {
            evaluationRunner = EvaluationRunner.getInstance();
            const initialLength = evaluationRunner.rulesTested.length;
            const ruleTest = { name: 'test-rule' } as any;
            evaluationRunner.addRuleTested(ruleTest);
            expect(evaluationRunner.rulesTested).to.have.lengthOf(initialLength + 1);
        });
    });

});