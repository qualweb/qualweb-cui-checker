import { ISerializable } from "../../ISerializable";

abstract class BaseAction implements ISerializable {
    abstract _type: string;

    abstract toJSON(): object;
} 
export default BaseAction;