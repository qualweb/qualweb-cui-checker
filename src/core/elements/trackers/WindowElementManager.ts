import AbstractElementManager from './base/AbstractElementManager';

class WindowElementManager extends AbstractElementManager<HTMLElement> {
  constructor(callBack?: (element: HTMLElement) => void) {
    super();
    this.callBack = callBack;
  }

  add(element: HTMLElement): boolean {
    if (this.containsElement(element)) {
      return false;
    }
    console.log('Adding element to manager  :', element);
    this.addElement(element);
    return true;
  }
}

export default WindowElementManager;
