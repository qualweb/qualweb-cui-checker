import { expect } from 'chai';
import * as sinon from 'sinon';
import AgentWorkflow from '../src/background/assistant-interaction/AgentWorkflow';
import * as graphModule from '../src/background/assistant-interaction/graph';

describe('AgentWorkflow', () => {
    let initiateLangraphSettingsStub: sinon.SinonStub;

    beforeEach(() => {
        // Reset singleton instance before each test
        (AgentWorkflow as any)._instance = null;
        initiateLangraphSettingsStub = sinon.stub(graphModule, 'initiateLangraphSettings');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getInstance', () => {
        it('should create a new instance on first call', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub() };
            initiateLangraphSettingsStub.resolves(mockGraph);

            const instance = await AgentWorkflow.getInstance(mockSettings as any);

            expect(instance).to.be.instanceOf(AgentWorkflow);
            expect(initiateLangraphSettingsStub.calledOnce).to.be.true;
        });

        it('should return the same instance on subsequent calls', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub() };
            initiateLangraphSettingsStub.resolves(mockGraph);

            const instance1 = await AgentWorkflow.getInstance(mockSettings as any);
            const instance2 = await AgentWorkflow.getInstance(mockSettings as any);

            expect(instance1).to.equal(instance2);
            expect(initiateLangraphSettingsStub.calledOnce).to.be.true;
        });
    });

    describe('getGraph', () => {
        it('should return the interaction graph', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub() };
            initiateLangraphSettingsStub.resolves(mockGraph);

            const instance = await AgentWorkflow.getInstance(mockSettings as any);
            const graph = instance.getGraph();

            expect(graph).to.exist;
        });
    });

    describe('destroy', () => {
        it('should call shutdown on the graph', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub().resolves() };
            initiateLangraphSettingsStub.resolves(mockGraph);

            const instance = await AgentWorkflow.getInstance(mockSettings as any);
            await instance.destroy();

            expect(mockGraph.shutdown.calledOnce).to.be.true;
        });

        it('should handle errors during shutdown gracefully', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub().rejects(new Error('Shutdown failed')) };
            const consoleWarnStub = sinon.stub(console, 'warn');
            initiateLangraphSettingsStub.resolves(mockGraph);

            const instance = await AgentWorkflow.getInstance(mockSettings as any);
            await instance.destroy();

            expect(consoleWarnStub.called).to.be.true;
            consoleWarnStub.restore();
        });

        it('should set interactionGraph to null after destroy', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub().resolves() };
            initiateLangraphSettingsStub.resolves(mockGraph);

            const instance = await AgentWorkflow.getInstance(mockSettings as any);
            await instance.destroy();
            const graph = instance.getGraph();

            expect(graph).to.be.null;
        });

        describe('connect to real graph open ai', () => {
            it('Should fail on incorrect API KEY provided', async () => {
            initiateLangraphSettingsStub.restore();
            const mockSettings = {
                apiKey: 'test-key',
                LLMService: 'openai',
                locale: "en-US"
            };
            const instance = await AgentWorkflow.getInstance(mockSettings);
            const graph = instance.getGraph();
            try {
                await graph.invoke({ messages: [{ role: "user", content: "hi!" }] });
                throw new Error("Esperava-se um erro de API key inválida, mas a chamada teve sucesso.");
            } catch (err: any) {

                expect(err).to.be.instanceOf(Error);
                expect(err.message).to.include("Incorrect API key provided");
            }
        });
        });
    });
});