import BaseAction from "./BaseAction";
import { ACTION_TYPE, IMarkElementAction } from "../types";

class MarkElementAction extends BaseAction implements IMarkElementAction {
    readonly _type = ACTION_TYPE.MARK_ELEMENT_ACTION;
    selector: string;
    check: string;
    
    constructor(check: string,selector: string) {
        super();
        this.selector = selector;
        this.check = check;
    }

    getSelector(): string {
        return this.selector;
    }

    getCheck(): string {
        return this.check;
    }

    toJSON(): object {
        return {
            _type: this._type,
            selector: this.selector,
            check: this.check,
        };
    }
}

export default MarkElementAction;