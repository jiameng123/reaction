import { observable,  isObservable } from "../src/index";



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


   /* it('should never let observables leak into the underlying raw object', () => {
        const obj:any = {};
        const obs = observable(obj);
        obs.nested1 = {};
        obs.nested2 = observable();
        expect(isObservable(obj.nested1)).toBeFalsy();
        expect(isObservable(obj.nested2)).toBeFalsy();
        expect(isObservable(obs.nested1)).toBeFalsy();
        expect(isObservable(obs.nested2)).toBeTruthy();
    });
   */
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