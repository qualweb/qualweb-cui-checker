import { INPUT_TYPE } from "./types";

class GraphBaseInput {
    private readonly message: string;
    protected readonly _type: string = INPUT_TYPE.GRAPH_BASE_INPUT;
    constructor(message: string) {
        this.message = message;
    }
    getMessage(): string {
        return this.message;
    }
    toJSON(): object {
        return {
            _type: this._type,
            message: this.message,
        };
    }
}

export default GraphBaseInput;