import { expect } from 'chai';
import * as sinon from 'sinon';
import ActionHandlerRegistry, { ActionHandlerArgs } from '../src/content/interaction/actions/ActionHandlerRegistry';
 
describe('ActionHandlerRegistry', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('register', () => {
        it('should register a handler for a given type', () => {
            const handler = sinon.stub().resolves();
            ActionHandlerRegistry.register('TestAction', handler);
            const types = ActionHandlerRegistry.getRegisteredTypes();
            expect(types).to.include('TestAction');
        });
    });

    describe('getRegisteredTypes', () => {
        it('should return all registered handler types', () => {
            const handler = sinon.stub().resolves();
            ActionHandlerRegistry.register('Action1', handler);
            ActionHandlerRegistry.register('Action2', handler);
            const types = ActionHandlerRegistry.getRegisteredTypes();
            expect(types).to.include('Action1');
            expect(types).to.include('Action2');
        });
    });

    describe('execute', () => {
        it('should execute the handler for a registered type', async () => {
            const handler = sinon.stub().resolves();
            ActionHandlerRegistry.register('TestAction', handler);
            const action = { _type: 'TestAction' } as any;
             const controller = new AbortController();
            const args = { signal: controller.signal } as ActionHandlerArgs;
            await ActionHandlerRegistry.execute(action, args);
            expect(handler.calledOnce).to.be.true;
            expect(handler.calledWith(action, args)).to.be.true;
        });

        it('should throw error for unregistered type', async () => {
            const action = { _type: 'UnregisteredAction' } as any;
            const controller = new AbortController();
            const args = { signal: controller.signal } as ActionHandlerArgs;
            let errorThrown = false;
            try {
                await ActionHandlerRegistry.execute(action, args);
            } catch {
                errorThrown = true;
            }
            expect(errorThrown).to.be.true;
        });
    });

    describe('executeActions', () => {
        it('should execute actions in correct order (QuestionAction and PlaySound last)', async () => {
            const executionOrder: string[] = [];
            const handler1 = sinon.stub().callsFake(async (action: any) => executionOrder.push(action._type));
            const handler2 = sinon.stub().callsFake(async (action: any) => executionOrder.push(action._type));
            const handler3 = sinon.stub().callsFake(async (action: any) => executionOrder.push(action._type));

            ActionHandlerRegistry.register('OtherAction', handler1);
            ActionHandlerRegistry.register('QuestionAction', handler2);
            ActionHandlerRegistry.register('PlaySound', handler3);

            const actions = [
                { _type: 'QuestionAction' },
                { _type: 'OtherAction' },
                { _type: 'PlaySound' }
            ];
            const controller = new AbortController();
            const args = { signal: controller.signal } as ActionHandlerArgs;

            await ActionHandlerRegistry.executeActions(actions as any, args);

            expect(executionOrder[0]).to.equal('OtherAction');
            expect(executionOrder[1]).to.equal('QuestionAction');
            expect(executionOrder[2]).to.equal('PlaySound');
        });

        it('should handle multiple actions', async () => {
            const handler = sinon.stub().resolves();
            ActionHandlerRegistry.register('ActionTest1', handler);
            ActionHandlerRegistry.register('ActionTest2', handler);
            const actions = [{ _type: 'ActionTest1' }, { _type: 'ActionTest2' }];
            const controller = new AbortController();
            const args = { signal: controller.signal } as ActionHandlerArgs;

            await ActionHandlerRegistry.executeActions(actions as any, args);

            expect(handler.callCount).to.equal(2);
        });
    });
});