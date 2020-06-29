
import { TRaw } from "./index.interface";
import Reactive from "./internals";
/**
 * @description 创建observable对象
 * @sig  a -> a
 * @param raw {*}
 * @returns {*}
 */
const observable = <T extends TRaw>(raw:T):T =>  {
    if(Reactive.proxyToRaw.has(raw)) return raw;
    return Reactive.rawToProxy.get(raw) || new Reactive<typeof raw>(raw).getProxy();
}

export const isObservable = <T extends object>(obj:T):boolean => Reactive.rawToProxy.has(obj);

export const getRaw = <T extends object>(proxy:T):T => Reactive.proxyToRaw.get(proxy);

export default observable;




