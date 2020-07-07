import { observable, observe, isObservable } from "../src/index";



describe("test observe",  () => {

    test("observe回调函数默认立即执行",() => {
        const callback = jest.fn();
        observe(callback);
        expect(callback).toBeCalled();
    });

    test("observe回调中嵌套observe，应正常执行",() => {
        const o = {a:1, b:2, c:3};
        const oObj = observable(o);
       
        observe(() => {
            oObj.a++;
            
            observe(() => {
                oObj.b++;
                observe(() => {
                    oObj.c++; 
                });
            });
        });

        expect(oObj.a).toBe(2);
        expect(oObj.b).toBe(3);
        expect(oObj.c).toBe(4);
        
        
        oObj.b++;
        expect(oObj.b).toBe(5);
        expect(oObj.c).toBe(6);
       
    });


    test("取消观察，observe回调函数不再执行", () => {
        const a  = {c:1, d:2};
        const oba =  observable(a);
        const testCallBack = jest.fn();

        const unobserve = observe(() => {
            const a = oba.c;
            testCallBack();
        });
        
        oba.c++;
        expect(testCallBack).toBeCalled();
        oba.c++;
    
        expect(testCallBack).toHaveBeenCalledTimes(3);
        unobserve();
        oba.c++;
        expect(testCallBack).toHaveBeenCalledTimes(3);
        
    });


    test("当一个可观测对象内同一个key，存在多个回调依赖，可正确执行，取消其中一个，其他的reaction依然可以正常执行", () =>{
        const  a  = { b:1, c:2};
        const oba = observable(a);
        const fn = jest.fn();
        const fn2 = jest.fn();
        const fn3 = jest.fn();
        
        const unob = observe(() => {
            const b = oba.b;
            fn(); 
        });

        const unob2 = observe(() => {
            const b = oba.b;
            fn2(); 
        });
        
        const unob3 = observe(() => {
            const c = oba.c;
            fn3(); 
        });

        oba.b++;
        oba.b++;
        oba.c++;

        expect(fn).toBeCalledTimes(3);
        expect(fn2).toBeCalledTimes(3);
        expect(fn3).toBeCalledTimes(2);

        unob();
        oba.b++;   
        expect(fn).toBeCalledTimes(3);
        expect(fn2).toBeCalledTimes(4);
        expect(fn3).toBeCalledTimes(2);

        unob2();
        oba.b++;   
        oba.c++;
        expect(fn).toBeCalledTimes(3);
        expect(fn2).toBeCalledTimes(4);
        expect(fn3).toBeCalledTimes(3);

        unob3();
        oba.c++;
        expect(fn).toBeCalledTimes(3);
        expect(fn2).toBeCalledTimes(4);
        expect(fn3).toBeCalledTimes(3);
    });
});

describe("test isObservable" , () => {
    test('observable包装的基本对象，isObservable返回true', () => {
       const a = {a:1,b:2};
       observable(a);
       expect(isObservable(a)).toBeTruthy();
    });

    test('primary对象，isObservable返回false', () => {
        const a = {a: 1, b:2};
        expect(isObservable(a)).toBeFalsy();
    });

});