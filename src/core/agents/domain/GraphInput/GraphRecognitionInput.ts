import GraphBaseInput from "./GraphBaseInput";
import { INPUT_TYPE } from "./types";

class GraphRecognitionInput extends GraphBaseInput {
    private readonly inputText: string;
    protected readonly _type: string = INPUT_TYPE.GRAPH_RECOGNITION_INPUT;
    constructor(message: string, inputText: string) {
        super(message);
        this.inputText = inputText;
    }
    getInputText(): string {
        return this.inputText;
    }
    toJSON(): object {
        const obj: any = {
            ...super.toJSON(),
            inputText: this.inputText,
        };
        obj["_type"] = this._type;
        return obj;
    }
}

export default GraphRecognitionInput;