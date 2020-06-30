
import IStore, { TRaw, TProxy , TSubscribe, TKey} from "./index.interface";
import handler from "./handler";
import Reaction from './reaction';

export default class Store<T extends object> implements IStore<T> {
    private raw: TRaw = {};
    private  _proxy: TProxy = {};
    static proxyToRaw = new WeakMap<object, any>();
    static rawToProxy = new WeakMap<object, any>();
    static connection = new WeakMap<TRaw, Map<TKey, Set<Reaction>>>();

    constructor(raw:T) {
        this.raw = raw;
        this._proxy = new Proxy(this.raw, handler);
     
        Store.rawToProxy.set(this.raw, this._proxy);
        Store.proxyToRaw.set(this._proxy, this.raw);
        Store.connection.set(this.raw, new Map<symbol | string | number, any>());
    }

    getProxy() {
      return this._proxy as T; 
    }
  
}


