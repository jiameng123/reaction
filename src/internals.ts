
import IReactive, { TRaw, TReactiveProxy ,TToProxy, TToRaw , TSubscribe, TKey} from "./index.interface";
import handle from "./handler";
const a = new WeakMap();
export default class Reactive<T extends object> implements IReactive<T> {
    private raw: TRaw = {};
    private  _proxy: TReactiveProxy = {};
    static proxyToRaw = new WeakMap<object, any>();
    static rawToProxy = new WeakMap<object, any>();
    static connection = new WeakMap<TRaw, Map<TKey, Set<TSubscribe>>>();
    static stackReaction = [];
    private _unSubscribe: Set<TSubscribe>[] = [];
    
    constructor(raw:T) {
        this.raw = raw;
        this._proxy = new Proxy(this.raw, handle);
        Reactive.rawToProxy.set(this.raw, this._proxy);
        Reactive.proxyToRaw.set(this._proxy, this.raw);
        Reactive.connection.set(this.raw, new Map<symbol | string | number, any>());
    }

    getProxy() {
     return this._proxy as T; 
    }
  
}


