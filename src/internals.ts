
import IStore, { TRaw, TProxy , TSubscribe, TKey} from "./index.interface";

import Reaction from './reaction';

 class Store<T extends object> implements IStore<T> {
   
    public proxyToRaw = new WeakMap<object, any>();
    public rawToProxy = new WeakMap<object, any>();
    public connection = new WeakMap<TRaw, Map<TKey, Set<Reaction>>>();

   
    public getProxy(raw:T) {
      return  this.rawToProxy.get(raw); 
    }

    public setProxy(raw:T, proxy:T) {
      this.rawToProxy.set(raw, proxy);
      this.proxyToRaw.set(proxy,raw);
      this.connection.set(raw, new Map<symbol | string | number, any>());
    }

    public getRaw (proxyObj:T) {
      return this.proxyToRaw.get(proxyObj) as T;
    }
  
}

export default new Store();



