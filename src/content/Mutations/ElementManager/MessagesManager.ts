import AbstractElementManager from '../AbstractElementManager';

class MessagesManager extends AbstractElementManager<HTMLElement> {
  constructor(callBack?: (element: HTMLElement) => void) {
    super();
    this.callBack = callBack;
  }

  add(element: HTMLElement): boolean {
    if (this.containsElement(element)) {
      return false;
    }
    this.addElement(element);
    return true;
  }
}

export default MessagesManager;
