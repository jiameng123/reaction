import handle from "./handler";

export type TProxy = object;
export type TRaw = object;

export type TKey = string | number | symbol;
export type TSubscribe = () => void;

export interface IOperation {
  type: "add" | "iterate" | "get" | "set" | "delete" | "clear" | "has";
  target: object;
  key: TKey;
  receiver?: unknown;
  value?: unknown;
  oldValue?: unknown;
}


export default abstract class IStore<T extends object> {
  
  abstract getProxy():T;
  
}




