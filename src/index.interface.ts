import handle from "./handler";

export type TReactiveProxy = object;
export type TRaw = object;
export type TToProxy<T extends object> = WeakMap<T, TReactiveProxy>;
export type TToRaw<T extends object> = WeakMap<TReactiveProxy, T>;
export type TKey = string | number | symbol;
export type TSubscribe = () => void;
export interface IOperation {
  type: "add" | "iterate" | "get" | "set" | "delete" | "clear" | "has";
  target: object;
  key?: TKey;
  receiver?: unknown;
  value?: unknown;
  oldValue?: unknown;
}


export default abstract class IReactive<T extends object> {
  
  abstract getProxy():T;
  
}




