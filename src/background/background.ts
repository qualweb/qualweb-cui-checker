import { initContentProxy } from './contentProxy';
import { initLifeCycleHandlers } from './lifeCycleHandlers';
import { initPortHandler } from './port-handler';
initLifeCycleHandlers();
initContentProxy();

initPortHandler();
