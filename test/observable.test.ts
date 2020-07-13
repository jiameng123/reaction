import { observable,  isObservable, observe } from "../src/index";




describe("test isObservable" , () => {
    
    test("没有提供参数时应返回一个新的observable", () => {
        const obs = observable();
       
        expect(isObservable(obs)).toBeTruthy();
    });

    test("应该返回observable参数的可观察包装对象", () => {
        const obj = {a:1};
        const obs = observable(obj);
        expect(obs === obj).toBeFalsy();
    });

    test("如果已经是可观察对象，则应返回observable参数", () => {
        const obs = observable();
        const obs2 = observable(obs);
      
        expect(obs === obs2).toBeTruthy();
    });

    test("当使用相同的参数重复调用时，应返回相同的可观察包装器", () => {
        const a = {a:1};
        const obs = observable(a);
        const obs2 = observable(a);
      
        expect(obs === obs2).toBeTruthy();
    });

    test("如果对象不可写，不应该包装成observable对象", () => {
        let dummy:number;
        const obj = {};
        Object.defineProperty(obj, 'prop', {
          value: { num: 12 },
          writable: false,
          configurable: false
        });
        const obs = observable(obj)
        observe(() => (dummy = obs.prop.num));
        expect(dummy).toEqual(12);
        (obj as any).prop.num = 13;
        expect(dummy).toEqual(12);
      });


   test("原始对象中不应该包含可观察对象", () => {
        const obj:any = {};
        const obs = observable(obj);
        obs.nested1 = {};
        obs.nested2 = observable();
        expect(isObservable(obj.nested1)).toBeFalsy();
        expect(isObservable(obj.nested2)).toBeFalsy();
        expect(isObservable(obs.nested1)).toBeFalsy();
        expect(isObservable(obs.nested2)).toBeTruthy();
        
    });
 
    test('observable包装的基本对象，isObservable返回true', () => {
       const a = {a:1,b:2};
       const obs = observable(a);
       expect(isObservable(obs)).toBeTruthy();
    });

    test('primary对象，isObservable返回false', () => {
        const a = {a: 1, b:2};
        expect(isObservable(a)).toBeFalsy();
    });

});


describe("isObservable", () => {
    test('如果将observable作为参数传递，则应返回true', () => {
      const obs = observable();
      const isObs = isObservable(obs);
      expect(isObs).toBeTruthy();
    });
  
    test("如果将不可观察的参数作为参数传递，则应返回false", () => {
      const obj1 = { prop: 'value' };
      const obj2 = new Proxy({}, {});
      const isObs1 = isObservable(obj1);
      const isObs2 = isObservable(obj2);
      expect(isObs1).toBeFalsy();
      expect(isObs2).toBeFalsy();
    });
  
    test("如果将primitive作为参数传递，则应返回false", () => {
      expect(isObservable(12 as any)).toBeFalsy();
    });

});