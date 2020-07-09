
import { TRaw } from "./index.interface";
import store from "./internals";
import handler from "./handler";
/**
 * @description 创建observable对象
 * @sig  a -> a
 * @param raw {*}
 * @returns {*}
 */
const observable = (raw?:TRaw) =>  {
    if(!raw) raw = {};
   
    if(store.proxyToRaw.has(raw)) return raw;
    const preProxyObjs = store.rawToProxy.get(raw);

    if(preProxyObjs) return preProxyObjs;
    store.setProxy(raw, new Proxy(raw, handler));

    return store.getProxy(raw);
}

export const isObservable = <T extends object>(obj:T):boolean => store.proxyToRaw.has(obj);

export const getRaw = <T extends object>(proxy:T):T => store.proxyToRaw.get(proxy) || proxy;

export default observable;




