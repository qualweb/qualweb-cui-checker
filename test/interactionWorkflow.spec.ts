import { expect } from 'chai';
import * as sinon from 'sinon';
import InteractionWorkflow from '../src/content/interaction/InteractionWorkflow';
import { FinalOutput } from '../src/background/assistant-interaction/objectives';
import sinonChrome from 'sinon-chrome';


describe('InteractionWorkflow', () => {
    let sandbox: sinon.SinonSandbox;
    let mockPort: sinon.SinonStubbedInstance<chrome.runtime.Port>;
    let mockSetMessage: sinon.SinonStub;
    let mockSendMessage: sinon.SinonStub;
    let mockCaptureNewMessages: sinon.SinonStub;
    let initialMsg: HTMLElement[];
    (global as any).chrome = sinonChrome;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        mockPort = {
            postMessage: sinon.stub(),
            onMessage: { addListener: sinon.stub() },
        } as any;

        mockSetMessage = sinon.stub().resolves();
        mockSendMessage = sinon.stub().resolves();
        mockCaptureNewMessages = sinon.stub().resolves([]);

        initialMsg = [document.createElement('div')];
        initialMsg[0].textContent = 'Test message';
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            const workflow = new InteractionWorkflow(
                initialMsg,
                mockSetMessage,
                mockSendMessage,
                mockPort
            );

            expect(workflow['initialMsg']).to.equal(initialMsg);
            expect(workflow['lastAnswersElements']).to.equal(initialMsg);
            expect(workflow['counter']).to.equal(0);
            expect(workflow['isRunning']).to.equal(true);
        });

        it('should generate unique thread_id', () => {
            const workflow1 = new InteractionWorkflow(
                initialMsg,
                mockSetMessage,
                mockSendMessage,
                mockPort
            );

            const workflow2 = new InteractionWorkflow(
                initialMsg,
                mockSetMessage,
                mockSendMessage,
                mockPort
            );

            expect(workflow1['configContract'].configurable.thread_id).to.not.equal(
                workflow2['configContract'].configurable.thread_id
            );
        });
    });

    describe('initInteraction', () => {
        it('should set up listeners and post initial message', async () => {
            const workflow = new InteractionWorkflow(
                initialMsg,
                mockSetMessage,
                mockSendMessage,
                mockPort
            );

            await workflow['initInteraction']();

            expect((mockPort.onMessage.addListener as sinon.SinonStub).calledOnce).to.be.true;
            expect((mockPort.postMessage as sinon.SinonStub).calledOnce).to.be.true;
        });
    });

    describe('extractAssistantMessage', () => {
        it('should extract and normalize text from elements', () => {
            const workflow = new InteractionWorkflow(
                initialMsg,
                mockSetMessage,
                mockSendMessage,
                mockPort
            );

            const elements = [document.createElement('div')];
            elements[0].textContent = 'Test content';

            const result = workflow['extractAssistantMessage'](elements);

            expect(result).to.be.a('string');
            expect(result).to.include('Test content');
        });
    });

    describe('markPreviousQuestionIfPassed', () => {
        it('should set attribute on elements when selector is string', () => {
            const workflow = new InteractionWorkflow(
                initialMsg,
                mockSetMessage,
                mockSendMessage,
                mockPort
            );

            const mockQuestion: FinalOutput = {
                lastMesssagePassedCheck: 'test-selector',
            } as any;

            workflow['lastAnswersElements'] = [document.createElement('div')];
            workflow['markPreviousQuestionIfPassed'](mockQuestion);

            expect(workflow['lastAnswersElements'][0].getAttribute('test-selector')).to.equal('');
        });
    });
});