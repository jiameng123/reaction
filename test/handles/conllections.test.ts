import { observable,  isObservable, observe } from "../../src/index";


describe("conllections", () => {

    test("具有全局构造函数的对象不应转换为可观察对象", () => {
      (window as any).MyClass = class MyClass {};
      const obj = new (window as any).MyClass();
      const obs = observable(obj);
      expect(obs === obj).toBeTruthy();
      expect(isObservable(obs)).toBeFalsy();
    })
  
    test("具有本地构造函数的对象应转换为可观察对象", () => {
      class MyClass {};
      const obj = new MyClass();
      const obs = observable(obj);
      expect(obs === obj).toBeFalsy();
      expect(isObservable(obs)).toBeTruthy();
    })
  
    test("全局对象应转换为可观察对象", () => {
      (window as any).obj = {};
      const obs = observable((window as any).obj);
      expect(obs !== (window as any).obj).toBeTruthy();
      expect(isObservable(obs)).toBeTruthy();
    })
  
    test("日期对象不应转换为可观察的日期", () => {
      const date = new Date();
      const obsDate = observable(date);
      expect(obsDate).toEqual(date);
      expect(isObservable(obsDate)).toBeFalsy();
    })
  
    test("RegExp对象不应转换为可观察的", () => {
      const regex = new (RegExp as any);
      const obsRegex = observable(regex);
      expect(obsRegex).toEqual(regex);
      expect(isObservable(obsRegex)).toBeFalsy();
    })
  
    test("Node 节点对象不应转换为可观察的", () => {
      const node = document;
      const obsNode = observable(node);
      expect(obsNode).toEqual(node);
      expect(isObservable(obsNode)).toBeFalsy();
    });

});