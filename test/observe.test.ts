import { observable, observe } from "../src/index";



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


    test("观察删除操作符", () => {
        let a;
        const obj = observable({ prop: 1 });
        observe(() => (a = obj.prop));
    
        expect(a).toEqual(1);
        delete obj.prop
        expect(a).toEqual(undefined);
    });


    test("新增属性应触发reactions", () => {
        const obs = observable();
        const fn = jest.fn();
        const unobs = observe(() => {
            const a = obs.a;
            fn();
        });

        Reflect.set(obs, "a",1);
        expect(fn).toBeCalledTimes(2);    
        
        obs.a = 2;
        expect(fn).toBeCalledTimes(3);
       
        unobs();
        obs.a = 3;
        expect(fn).toBeCalledTimes(3);
    });


    test("添加DOM元素时不应出错", () => {
        let dummy = null;
        const observed = observable({ obj: null });
        observe(() => (dummy = observed.obj && observed.obj.nodeType));

        expect(dummy).toBeNull();
        observed.obj = document;
        expect(dummy).toEqual(9);
    });
    

    test("观察可迭代对象", async () => {
        let dummy;
        const list = observable(['Hello']);
        observe(() => (dummy = list.join(' ')));
    
        expect(dummy).toEqual('Hello');
        list.push('World!');
        expect(dummy).toEqual('Hello World!');
        list.shift();
        list[1] = "aaaa";
        expect(dummy).toEqual('World! aaaa');
    });

    test("应该能观察多个属性", () => {
        let dummy;
        const counter = observable({ num1: 0, num2: 0 });
        observe(() => (dummy = counter.num1 + counter.num1 + counter.num2));
    
        expect(dummy).toEqual(0);
        counter.num1 = counter.num2 = 7;
        expect(dummy).toEqual(21);
    });

    test("同一属性多个reaction应该能正确执行", () => {
        let dummy1, dummy2
        const counter = observable({ num: 0 })
        observe(() => (dummy1 = counter.num))
        observe(() => (dummy2 = counter.num))
    
        expect(dummy1).toEqual(0)
        expect(dummy2).toEqual(0)
        counter.num++
        expect(dummy1).toEqual(1)
        expect(dummy2).toEqual(1)
    });


    test("应该能观察嵌套属性", () => {
        let dummy
        const counter = observable({ nested: { num: 0 } })
        observe(() => (dummy = counter.nested.num))
    
        expect(dummy).toEqual(0)
        counter.nested.num = 8
        expect(dummy).toEqual(8)
    });

  
});
