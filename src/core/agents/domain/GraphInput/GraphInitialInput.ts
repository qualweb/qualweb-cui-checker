import GraphBaseInput from "./GraphBaseInput";
import { INPUT_TYPE } from "./types";

class GraphInitialInput extends GraphBaseInput  {
  private readonly url: string;
  protected readonly _type: string = INPUT_TYPE.GRAPH_INITIAL_INPUT;
  constructor(message: string, url: string) {
    super(message);
    this.url = url;
  }
  getUrl(): string {
    return this.url;
  }
  
  toJSON(): object {
    const obj: any = {
      ...super.toJSON(),
      url: this.url,
  };
  obj["_type"] = this._type;
  return obj;
  }

}
export default GraphInitialInput;