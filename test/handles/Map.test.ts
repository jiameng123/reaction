import { observable,  isObservable, observe } from "../../src/index";
import store from "../../src/internals";

describe("Map", () => {
    test("Map对象应该是可包装的", () => {
        const map = observable(new Map());
        expect(map).toBeInstanceOf(Map);
        expect(store.getRaw(map)).toBeInstanceOf(Map);
        expect(isObservable(map)).toBeTruthy();
        
    });

    test("应该观察set方法", () => {
        let dummy;
        const map = observable(new Map());
       
        observe(() => (dummy = map.get('key')));
        expect(dummy).toBeUndefined();
        map.set('key', 'value');
        expect(dummy).toEqual('value');
        map.set('key', 'value2');
        expect(dummy).toEqual('value2');
        map.delete('key');
        expect(dummy).toBeUndefined();
      })
    
      test("应该观察size改变", () => {
        let dummy
        const map = observable(new Map())
        observe(() => (dummy = map.size))
    
        expect(dummy).toBe(0)
        map.set('key1', 'value')
        map.set('key2', 'value2')
        expect(dummy).toEqual(2)
        map.delete('key1')
        expect(dummy).toEqual(1)
        map.clear()
        expect(dummy).toEqual(0)
      });
   

    
});