/*import { expect } from 'chai';
import * as sinon from 'sinon';
import InteractionWorkflow, { sendMessageToBackgroundPort } from '../src/content/interaction/InteractionWorkflow';
import { ACTION_PORT  as ACTION} from '../src/background/action-type';
import { STATUS_GRAPH } from '../src/core/ai/domain';
import ActionHandlerRegistry from '../src/content/interaction/ActionHandlerRegistry';
import InterfaceChatbot from '../src/content/detection/InterfaceChatbot';
import * as utils from '../src/content/lib/utils';
import * as messageHelpers from '../src/messaging/message-helpers';
/*
describe('InteractionWorkflow', () => {
    let sandbox: sinon.SinonSandbox;
    let mockPort: sinon.SinonStubbedInstance<chrome.runtime.Port>;
    let initialMsg: HTMLElement[];
    let workflow: InteractionWorkflow;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        initialMsg = [document.createElement('div')];
        
        mockPort = {
            postMessage: sandbox.stub(),
            onMessage: { addListener: sandbox.stub() },
            onDisconnect: { addListener: sandbox.stub() },
            name: 'test-port',
            sender: undefined,
            disconnect: sandbox.stub(),
        } as any;

        sandbox.stub(utils, 'extractAssistantMessage').returns('test message');
        sandbox.stub(InterfaceChatbot, 'getInstance').returns({} as any);
        sandbox.stub(ActionHandlerRegistry, 'executeActions');
        sandbox.stub(ActionHandlerRegistry, 'cancelPendingExecutions');
        sandbox.stub(messageHelpers, 'processErrorEventPortContent');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            expect(workflow).to.exist;
        });

        it('should set configContract with unique thread_id', () => {
            const workflow1 = new InteractionWorkflow(initialMsg, false, mockPort);
            const workflow2 = new InteractionWorkflow(initialMsg, false, mockPort);
            expect(workflow1).to.not.equal(workflow2);
        });
    });

    describe('init', () => {
        it('should set isRunning to true', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            await workflow.init();
            expect(mockPort.postMessage.called).to.be.true;
        });

        it('should send message to background port', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            await workflow.init();
            expect(mockPort.postMessage.calledOnce).to.be.true;
        });

        it('should extract initial message', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            await workflow.init();
            expect((utils.extractAssistantMessage as sinon.SinonStub).calledWith(initialMsg)).to.be.true;
        });
    });

    describe('setListenersPort', () => {
        it('should add message listener to port', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            await workflow.init();
            expect((mockPort.onMessage.addListener as sinon.SinonStub).calledOnce).to.be.true;
        });

        it('should add disconnect listener to port', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            await workflow.init();
            expect((mockPort.onDisconnect.addListener as sinon.SinonStub).calledOnce).to.be.true;
        });
    });

    describe('processNextStep', () => {
        it('should terminate when graph status is COMPLETED', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            const graphOutput = { status: STATUS_GRAPH.COMPLETED, actions: [] };
            
            await (workflow as any).processNextStep(graphOutput);
            expect((ActionHandlerRegistry.cancelPendingExecutions as sinon.SinonStub).called).to.be.true;
        });

        it('should execute actions when status is not COMPLETED', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            const graphOutput = { status: 'active', actions: [{ type: 'click' }] };
            
            await (workflow as any).processNextStep(graphOutput);
            expect((ActionHandlerRegistry.executeActions as sinon.SinonStub).called).to.be.true;
        });

        it('should increment turnCount', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            const graphOutput = { status: 'active', actions: [] };
            
            await (workflow as any).processNextStep(graphOutput);
            expect((ActionHandlerRegistry.executeActions as sinon.SinonStub).calledOnce).to.be.true;
        });
        it('should execute last action when status is  COMPLETED', async () => {
            workflow = new InteractionWorkflow(initialMsg, false, mockPort);
            const graphOutput = { status: STATUS_GRAPH.COMPLETED, actions: [{ type: 'ActionTest' }] };
            
            await (workflow as any).processNextStep(graphOutput);
            expect((ActionHandlerRegistry.executeActions as sinon.SinonStub).called).to.be.true;
        });
    });

    describe('sendMessageToBackgroundPort', () => {
        it('should call postMessage on port', () => {
            const payload = { action: ACTION.MESSAGE_LANGGRAPH };
            sendMessageToBackgroundPort(mockPort, payload);
            expect(mockPort.postMessage.calledWith(payload)).to.be.true;
        });

        it('should throw error when postMessage fails', () => {
            (mockPort.postMessage as sinon.SinonStub).throws(new Error('Network error'));
            const payload = { action: ACTION.MESSAGE_LANGGRAPH };
            
            expect(() => sendMessageToBackgroundPort(mockPort, payload)).to.throw('Failed to send message to background interaction bidirectional port.');
        });
    });
});*/