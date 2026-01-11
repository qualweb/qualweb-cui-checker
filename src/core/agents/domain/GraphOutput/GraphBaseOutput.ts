import { ISerializable } from '../ISerializable';
import { StatusGraph } from '../types';

class QWGraphOutput implements ISerializable {
  private readonly status: StatusGraph;
  public readonly _type: string = 'QWGraphOutput';

  constructor(status: StatusGraph) {
    this.status = status;
  }
  public getStatus(): StatusGraph {
    return this.status;
  }

  toJSON(): object {
    return {
      _type: this._type,
      status: this.status,
    };
  }
}

export default QWGraphOutput;
