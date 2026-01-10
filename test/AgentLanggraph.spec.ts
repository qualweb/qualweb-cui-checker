import { expect } from 'chai';
import * as sinon from 'sinon';
import { AgentOrchestratorFactory } from  '../src/core/agents/AgentOrchestratorFactory';
import AgentOrchestrator from '../src/core/agents/AgentOrchestrator';
import * as graphModule from '../src/core/agents/langgraph-orchestrator';

describe('AgentWorkflow', () => {
    let initiateLangraphSettingsStub: sinon.SinonStub;

    beforeEach(() => {

        // Reset singleton instance before each test
        initiateLangraphSettingsStub = sinon.stub(graphModule, 'initiateLangraphSettings');
    });

    afterEach(() => {
        AgentOrchestratorFactory.destroy();
        sinon.restore();
    });

    describe('getInstance', () => {
        it('should create a new instance on first call', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub() };
            initiateLangraphSettingsStub.resolves(mockGraph);
            AgentOrchestratorFactory.create(mockSettings as any,false);
            const instance = await AgentOrchestratorFactory.getInstance();

            expect(instance).to.be.instanceOf(AgentOrchestrator);
            expect(initiateLangraphSettingsStub.calledOnce).to.be.true;
        });

        it('should return the same instance on subsequent calls', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub() };
            initiateLangraphSettingsStub.resolves(mockGraph);
            AgentOrchestratorFactory.create( mockSettings as any,false);
            const instance1 =  AgentOrchestratorFactory.getInstance();
            const instance2 =  AgentOrchestratorFactory.getInstance();

            expect(instance1).to.equal(instance2);
            expect(initiateLangraphSettingsStub.calledOnce).to.be.true;
        });
    });

    describe('getGraph', () => {
        it('should return the interaction graph', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub() };
            initiateLangraphSettingsStub.resolves(mockGraph);
             initiateLangraphSettingsStub.resolves(mockGraph);
            AgentOrchestratorFactory.create( mockSettings as any,false);
            const instance = AgentOrchestratorFactory.getInstance();
            const graph = instance?.getGraph();

            expect(graph).to.exist;
        });
    });

    describe('destroy', () => {
        it('should call shutdown on the graph', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub().resolves() };
            initiateLangraphSettingsStub.resolves(mockGraph);
                        AgentOrchestratorFactory.create( mockSettings as any,false);

            const instance = AgentOrchestratorFactory.getInstance();
            await instance?.destroy();

            expect(mockGraph.shutdown.calledOnce).to.be.true;
        });

      

        it('should set interactionGraph to null after destroy', async () => {
            const mockSettings = { apiKey: 'test-key' };
            const mockGraph = { shutdown: sinon.stub().resolves() };
            initiateLangraphSettingsStub.resolves(mockGraph);
            AgentOrchestratorFactory.create( mockSettings as any,false);
            const instance = AgentOrchestratorFactory.getInstance();
            await instance?.destroy();
            const graph = instance?.getGraph();

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
            AgentOrchestratorFactory.create( mockSettings as any,false);

            const instance = AgentOrchestratorFactory.getInstance();
            const graph = instance?.getGraph();
            try {
                await graph.invoke({ _type:'GraphBaseInput', message: "Hello" } );
            } catch (err: any) {

                expect(err).to.be.instanceOf(Error);
            
            }
        });
        });
    });
});