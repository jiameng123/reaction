
import IStore, { TRaw, TProxy , TSubscribe, TKey} from "./index.interface";

import Reaction from './reaction';

export default class Store<T extends object> implements IStore<T> {
    private raw: TRaw = {};
    private  _proxy: TProxy = {};
    static proxyToRaw = new WeakMap<object, any>();
    static rawToProxy = new WeakMap<object, any>();
    static connection = new WeakMap<TRaw, Map<TKey, Set<Reaction>>>();

    constructor(raw:T, proxy:T) {
        this.raw = raw;
        this._proxy = proxy;
     
        Store.rawToProxy.set(this.raw, this._proxy);
        Store.proxyToRaw.set(this._proxy, this.raw);
        Store.connection.set(this.raw, new Map<symbol | string | number, any>());
    }

      getProxy() {
      return this._proxy as any; 
    }

    static getRaw () {
      return (this as any).raw;
    }
  
}



