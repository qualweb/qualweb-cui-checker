import { expect } from 'chai';
import * as sinon from 'sinon';
import  TimeoutManager  from '../src/content/Mutations/TimeoutManager';

describe('TimeoutManager', () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should create an instance with default maxTime of 5000', () => {
        const callback = sinon.spy();
        const manager = new TimeoutManager(callback);
        expect(manager).to.be.instanceOf(TimeoutManager);
    });

    it('should create an instance with custom maxTime', () => {
        const callback = sinon.spy();
        const manager = new TimeoutManager(callback, 3000);
        expect(manager).to.be.instanceOf(TimeoutManager);
    });

    it('should call the callback after startTimeout', () => {
        const callback = sinon.spy();
        const manager = new TimeoutManager(callback, 1000);
        manager.startTimeout();
        clock.tick(1000);
        expect(callback.calledOnce).to.be.true;
    });

    it('should clear and restart timeout on restartTimeout', () => {
        const callback = sinon.spy();
        const manager = new TimeoutManager(callback, 1000);
        manager.startTimeout();
        clock.tick(500);
        manager.restartTimeout();
        clock.tick(500);
        expect(callback.called).to.be.false;
        clock.tick(500);
        expect(callback.calledOnce).to.be.true;
    });

    it('should stop the timeout without calling callback', () => {
        const callback = sinon.spy();
        const manager = new TimeoutManager(callback, 1000);
        manager.startTimeout();
        manager.stopTimeout();
        clock.tick(1000);
        expect(callback.called).to.be.false;
    });

    it('should update maxTime with setMaxTime', () => {
        const callback = sinon.spy();
        const manager = new TimeoutManager(callback, 1000);
        manager.setMaxTime(2000);
        manager.startTimeout();
        clock.tick(1000);
        expect(callback.called).to.be.false;
        clock.tick(1000);
        expect(callback.calledOnce).to.be.true;
    });
});