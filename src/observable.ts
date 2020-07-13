
import { TRaw } from "./index.interface";
import store from "./internals";
import getHandles, { shouldInstrument } from "./handles/index";
/**
 * @description 创建observable对象
 * @sig  a -> a
 * @param raw {*}
 * @returns {*}
 */
const observable = (raw:TRaw = {}) =>  {
    
    if(store.proxyToRaw.has(raw) || !shouldInstrument(raw)) return raw;
    const preProxyObjs = store.rawToProxy.get(raw);

    if(preProxyObjs) return preProxyObjs;
    
    store.setProxy(raw, new Proxy(raw, getHandles(raw)));

    return store.getProxy(raw);
}

export const isObservable = <T extends object>(obj:T):boolean => store.proxyToRaw.has(obj);



export default observable;




