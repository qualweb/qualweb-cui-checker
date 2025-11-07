import { expect } from 'chai';
import * as sinon from 'sinon';
import MutationChatbotDetect from '../src/content/Mutations/Detection/MutationChatbotDetect';
import ElementFoundManager from '../src/content/Mutations/AbstractElementManager';
import TimeoutManager from '../src/content/Mutations/TimeoutManager';

describe('MutationChatbotDetect', () => {
    let elementTracker: sinon.SinonStubbedInstance<ElementFoundManager<HTMLElement>>;
    let ignoreInput: HTMLElement;
    let mutationDetect: MutationChatbotDetect;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        elementTracker = sandbox.stub(Object.create(ElementFoundManager.prototype));
        ignoreInput = document.createElement('input');
        mutationDetect = new MutationChatbotDetect(ignoreInput);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should initialize with elementTracker and ignoreInput', () => {
            expect(mutationDetect.elementTracker).to.equal(elementTracker);
            expect(mutationDetect.ignoreInput).to.equal(ignoreInput);
        });

        it('should set initialText from APP_CONFIG', () => {
            expect(mutationDetect.initialText).to.equal(APP_CONFIG.INITIAL_INTERACTION_MESSAGE_PT);
        });
    });

    describe('handleAddedNodes', () => {
        it('should skip non-Element nodes', () => {
            const textNode = document.createTextNode('text');
            const mutation = {
                type: 'childList',
                addedNodes: { 0: textNode, length: 1 } as unknown as NodeList,
                target: document.createElement('div'),
            } as unknown as MutationRecord;

            mutationDetect.handleAddedNodes(mutation);
            expect(elementTracker.add.called).to.be.false;
        });

        it('should skip nodes inside ignoreInput', () => {
            const child = document.createElement('span');
            ignoreInput.appendChild(child);
            const mutation = {
                type: 'childList',
                addedNodes: { 0: child, length: 1 } as unknown as NodeList,
                target: ignoreInput,
            } as unknown as MutationRecord;

            mutationDetect.handleAddedNodes(mutation);
            expect(elementTracker.add.called).to.be.false;
        });

        it('should add element when text matches and not a BUTTON', () => {
            const div = document.createElement('div');
            div.textContent = APP_CONFIG.INITIAL_INTERACTION_MESSAGE_PT;
            const mutation = {
                type: 'childList',
                addedNodes: { 0: div, length: 1 } as unknown as NodeList,
                target: document.body,
            } as unknown as MutationRecord;

            sandbox.stub(global as any, 'findElementByExactText').returns(div);
            mutationDetect.handleAddedNodes(mutation);
            expect(elementTracker.add.called).to.be.true;
        });

        it('should not add BUTTON elements', () => {
            const button = document.createElement('button');
            button.textContent = APP_CONFIG.INITIAL_INTERACTION_MESSAGE_PT;
            const mutation = {
                type: 'childList',
                addedNodes: { 0: button, length: 1 } as unknown as NodeList,
                target: document.body,
            } as unknown as MutationRecord;

            sandbox.stub(global as any, 'findElementByExactText').returns(button);
            mutationDetect.handleAddedNodes(mutation);
            expect(elementTracker.add.called).to.be.false;
        });
    });

    describe('handleCharacterDataChange', () => {
        it('should add element when text content matches', () => {
            const parent = document.createElement('div');
            const textNode = document.createTextNode(APP_CONFIG.INITIAL_INTERACTION_MESSAGE_PT);
            parent.appendChild(textNode);

            const mutation = {
                type: 'characterData',
                target: textNode,
            } as unknown as MutationRecord;

            mutationDetect.handleCharacterDataChange(mutation);
            expect(elementTracker.add.called).to.be.true;
        });

        it('should not add element when text content does not match', () => {
            const parent = document.createElement('div');
            const textNode = document.createTextNode('different text');
            parent.appendChild(textNode);

            const mutation = {
                type: 'characterData',
                target: textNode,
            } as unknown as MutationRecord;

            mutationDetect.handleCharacterDataChange(mutation);
            expect(elementTracker.add.called).to.be.false;
        });
    });

    describe('cancelMutationObserver', () => {
        it('should stop timeout and disconnect observer', () => {
            (mutationDetect as any).observer = sandbox.createStubInstance(MutationObserver);
            (mutationDetect as any).timeoutManager = sandbox.createStubInstance(TimeoutManager);

            mutationDetect.cancelMutationObserver();

            expect((mutationDetect as any).timeoutManager?.stopTimeout.called).to.be.true;
            expect((mutationDetect as any).observer?.disconnect.called).to.be.true;
        });


    });
});