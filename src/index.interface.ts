

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

  readonly raw: TRaw = {};
  readonly proxy: TReactiveProxy = {};

  private _weakMapRaw: TToRaw<object> = new WeakMap<T, T>();
  private _weakMapProxy: TToProxy<object> = new WeakMap<T, T>();
  private _connection = new WeakMap<TRaw, Map<TKey, Set<TSubscribe>>>();
  private _unSubscribe: Set<TSubscribe>[] = [];

  constructor(raw?: TRaw) {
    if (raw) {
      this.raw = raw;
    }

    this.proxy = new Proxy(this.raw, {});
    this._weakMapProxy.set(this.raw, this.proxy);
    this._weakMapRaw.set(this.proxy, this.raw);
  } 

  abstract getProxy():T;

  abstract observable<T extends TRaw>(raw?: T): this;
  
  private saveObservable() {
    this._connection.set(this.raw, new Map<TKey, Set<TSubscribe>>()); 
  }

}




