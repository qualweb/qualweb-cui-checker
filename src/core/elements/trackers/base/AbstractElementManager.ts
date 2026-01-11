// abstract class for strategy to track elements based on mutations
abstract class AbstractElementManager<E> {
  protected Elements: Set<E> = new Set();
  protected callBack?: (element: E) => void;

  //Can receive a callback to be executed when a new element is added
  abstract add(element: E): boolean;

  getElements(): Set<E> {
    return this.Elements;
  }

  addElement(element: E): void {
    if (!this.Elements.has(element)) {
      this.Elements.add(element);
      if (this.callBack) this.callBack(element);
    }
  }
  getElementsCount(): number {
    return this.Elements.size;
  }
  containsElement(element: E): boolean {
    return this.Elements.has(element);
  }

  getElementsArray(): E[] {
    return Array.from(this.Elements);
  }

  getFirstElement(): E | null {
    return this.getElementsArray()[0] || null;
  }

  clear(): void {
    this.Elements.clear();
  }
}

export default AbstractElementManager;
