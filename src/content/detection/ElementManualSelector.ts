import { findButton, getGroupSelectorRelative } from "../lib/DomTools";
import* as Error from "../../errors/content/errors.class.content";


export interface IManualSelectionResult {
  selector: string;
}

/** Context for manual element selection
 * 
 */
export interface ISelectionContext {
  document: Document;
  
  /** Callback optional to show messages in the UI */
  showMessage?: (msg: string) => void;
  
  /** Callback optional to hide messages in the UI */
  hideMessage?: () => void;
}
type ElementFinder = (target: HTMLElement, clickX: number, clickY: number) => HTMLElement | null;

export class ElementManualSelector {
  private onClickHandler: ((event: MouseEvent) => void) | null = null;
  private abortController: AbortController | null = null;
  private readonly elementFinder: (target: HTMLElement, clickX: number, clickY: number) => HTMLElement | null;
  private readonly selectorGenerator: (element: HTMLElement) => string;
  private readonly context: ISelectionContext;
  
  constructor(
    context: ISelectionContext,
    elementFinder: ElementFinder = findButton,
    selectorGenerator: (element: HTMLElement) => string = getGroupSelectorRelative,
  ) {
    this.elementFinder = elementFinder;
    this.selectorGenerator = selectorGenerator;
    this.context = context;
  }

  
  public async init(): Promise<IManualSelectionResult> {

    this.abortController = new AbortController();
    
    if (this.context.showMessage) this.context.showMessage('Please click on the target element');

    return new Promise((resolve, reject) => {
      
      this.abortController?.signal.addEventListener('abort', () => {
        this.cleanup(this.context);
        reject(new Error.CancellationError());
      });

      this.onClickHandler = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const target = event.target as HTMLElement;
        const button = this.elementFinder(target, event.clientX, event.clientY);

        if (!button) {
          if (this.context.showMessage) this.context.showMessage('Invalid target. Please click a button.');
          return;
        }

        const selector = this.selectorGenerator(button);
        this.cleanup(this.context);
        resolve({ selector });
      };

      this.context.document.addEventListener('click', this.onClickHandler, true);
    });
  }



  public cancelSelection(): void {
    this.abortController?.abort();
  }

  private cleanup(context: ISelectionContext): void {
    if (this.onClickHandler) {
      context.document.removeEventListener('click', this.onClickHandler, true);
      this.onClickHandler = null;
    }
    if (context.hideMessage) context.hideMessage();
    this.abortController = null;
  }
}