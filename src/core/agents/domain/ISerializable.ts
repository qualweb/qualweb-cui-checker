export interface ISerializable {
  _type: string;
  toJSON(): object;
}
