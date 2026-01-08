import { CancellationError } from "../../errors/content/errors.class.content";

export function interruptSignalHandlerWithError(signal: AbortSignal) {
  if (signal.aborted) throw new CancellationError();
  /*signal.addEventListener('abort', () => {
    throw new CancellationError();
  }, { once: true });*/
  /*return new Promise((_, reject) => {
    if (signal.aborted) {
      return reject(new CancellationError());
    }
    
    signal.addEventListener('abort', () => {
      reject(new CancellationError());
    }, { once: true });
  });*/
}

export function interruptSignalHandlerWithCallback<E>(signal: AbortSignal, callback: (e?: E) => void, data?: E) {
  if (signal.aborted) {
    callback(data);
    return;
  }
  signal.addEventListener('abort', () => {
    callback(data);
  }, { once: true });
}
