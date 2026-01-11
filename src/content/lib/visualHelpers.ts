const STYLE_ID = 'chatbot-green-style';
const OVERLAY_CLASS = 'chatbot-element-overlay';

const listenersMap = new WeakMap<HTMLElement, { onScroll: () => void; onResize: () => void }>();
const activeElements = new Set<HTMLElement>();

function updateOverlayPosition(
  element: HTMLElement,
  overlay: HTMLElement,
  limitElement?: HTMLElement,
) {
  const rect = element.getBoundingClientRect();

  let top = rect.top;
  let left = rect.left;
  let width = rect.width;
  let height = rect.height;

  if (limitElement) {
    const limitRect = limitElement.getBoundingClientRect();

    if (top < limitRect.top) {
      height -= limitRect.top - top;
      top = limitRect.top;
    }
    if (left < limitRect.left) {
      width -= limitRect.left - left;
      left = limitRect.left;
    }

    const limitBottom = limitRect.top + limitRect.height;
    const limitRight = limitRect.left + limitRect.width;

    if (top + height > limitBottom) {
      height = limitBottom - top;
    }
    if (left + width > limitRight) {
      width = limitRight - left;
    }
  }

  // Garantir que largura e altura não ficam negativas
  if (width <= 0 || height <= 0) {
    overlay.style.display = 'none';
    return;
  } else {
    overlay.style.display = 'block';
  }

  overlay.style.top = `${top}px`;
  overlay.style.left = `${left}px`;
  overlay.style.width = `${width}px`;
  overlay.style.height = `${height}px`;
}

export function setGreen(element: HTMLElement, limitElement?: HTMLElement): void {
  if (!element) return;
  const documentToOverlay = element.ownerDocument;

  if (!documentToOverlay.getElementById(STYLE_ID)) {
    const styleEl = documentToOverlay.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = `
      @keyframes heartbeat {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .chatbot-green-heartbeat {
        animation: heartbeat 1.5s ease-in-out infinite;
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        background-color: rgba(0, 255, 0, 0.5);
        transition: opacity 0.5s ease-in-out;
        border-radius: 8px;
        outline: 2px solid rgba(0, 255, 0, 0.8);
        outline-offset: 2px;
        border-radius: 8px;
      }
    `;
    documentToOverlay.head.appendChild(styleEl);
  }

  const flashOverlay = documentToOverlay.createElement('div');
  flashOverlay.className = `${OVERLAY_CLASS} chatbot-green-heartbeat`;

  documentToOverlay.body.appendChild(flashOverlay);

  const update = () => updateOverlayPosition(element, flashOverlay, limitElement);

  update();

  window.addEventListener('resize', update);
  window.addEventListener('scroll', update, true); // capture phase
  activeElements.add(element);
  listenersMap.set(element, {
    onResize: update,
    onScroll: update,
  });

  requestAnimationFrame(() => {
    flashOverlay.style.opacity = '1';
  });
}
export async function unsetGreen(element: HTMLElement): Promise<void> {
  const doc = element.ownerDocument;
  const overlays = doc.querySelectorAll(`.${OVERLAY_CLASS}`);

  const removePromises = Array.from(overlays).map((overlay) => {
    (overlay as HTMLElement).style.animation = 'none';

    return new Promise<void>((resolve) => {
      (overlay as HTMLElement).style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 500);
    });
  });

  // Remove all listeners of the weakmap
  for (const el of activeElements.keys()) {
    const listeners = listenersMap.get(el);
    if (listeners) {
      window.removeEventListener('resize', listeners.onResize);
      window.removeEventListener('scroll', listeners.onScroll, true);
      listenersMap.delete(el);
    }
  }

  await Promise.all(removePromises);
}

export async function unsetAllGreens(): Promise<void> {
  await unsetGreen(document.body);
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      if (iframe.contentDocument) {
        await unsetGreen(iframe.contentDocument.body);
      }
    } catch {
      // Ignore cross-origin iframes
    }
  }
}
