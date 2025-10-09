
let previousBoxShadow: string ="";
let previousStyleTransition: string = "";
let previousParentPosition:string = "";
/**
 *
 * @param element
 * @returns
 */
export function setGreen(element: HTMLElement): void {
  if (!element) return;
  const documentToOverlay = element.ownerDocument;

  if (
    element.tagName === 'BUTTON' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'INPUT' ||
    element.isContentEditable
  ) {
    previousBoxShadow = element.style.boxShadow;
    previousStyleTransition = element.style.transition;

    element.style.transition = 'box-shadow 0.5s ease-in-out';
    element.style.boxShadow = '0 0 0 1000px rgba(0, 255, 0, 0.5) inset';
    return;
  } else {
    const flashOverlay = documentToOverlay.createElement('div');
    flashOverlay.className = 'chatbot-element-overlay';

    flashOverlay.style.position = 'absolute';
    flashOverlay.style.pointerEvents = 'none';
    flashOverlay.style.zIndex = '10000';
    flashOverlay.style.left = `0`;
    flashOverlay.style.top = `0`;
    flashOverlay.style.width = `100%`;
    flashOverlay.style.height = `100%`;
    flashOverlay.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    flashOverlay.style.transition = 'opacity 0.5s ease-in-out';
    flashOverlay.style.opacity = '0';
    previousParentPosition = element.style.position;
    element.style.position = 'relative';
    element.appendChild(flashOverlay);

    requestAnimationFrame(() => {
      flashOverlay.style.opacity = '1';
    });
  }
}

/**
 *
 * @param element
 * @returns
 */
export function unsetGreen(element: HTMLElement | HTMLElement[]): void {
  if (!element) return;
  const elementArray: HTMLElement[] = Array.isArray(element) ? element : [element];

  for (const el of elementArray) {
    if (
      el.tagName === 'TEXTAREA' ||
      el.tagName === 'BUTTON' ||
      el.tagName === 'INPUT' ||
      el.isContentEditable
    ) {
      el.style.boxShadow = previousBoxShadow;
      el.style.transition = previousStyleTransition;
    } else {
      const overlay = el.querySelector('.chatbot-element-overlay') as HTMLElement | null;
      if (overlay) {
        overlay.style.opacity = '0';

        setTimeout(() => {
          overlay.remove();
          el.style.position = previousParentPosition;
        }, 500);
      }
    }
  }
  previousStyleTransition = "";
  previousBoxShadow = "";
  previousParentPosition = "";
}
