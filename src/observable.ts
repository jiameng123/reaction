
import { TRaw } from "./index.interface";
import Store from "./internals";
/**
 * @description 创建observable对象
 * @sig  a -> a
 * @param raw {*}
 * @returns {*}
 */
const observable = <T extends TRaw>(raw:T):T =>  {
    if(Store.proxyToRaw.has(raw)) return raw;
    return Store.rawToProxy.get(raw) || new Store<typeof raw>(raw).getProxy();
}

export const isObservable = <T extends object>(obj:T):boolean => Store.rawToProxy.has(obj);

export const getRaw = <T extends object>(proxy:T):T => Store.proxyToRaw.get(proxy);

export default observable;




