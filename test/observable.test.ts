import { observable, isObservable, observe } from "../src/index";
import store from "../src/internals";

describe("test isObservable", () => {
  test("没有提供参数时应返回一个新的observable", () => {
    const obs = observable();

    expect(isObservable(obs)).toBeTruthy();
  });

  test("应该返回observable参数的可观察包装对象", () => {
    const obj = { a: 1 };
    const obs = observable(obj);
    expect(obs === obj).toBeFalsy();
  });

  test("如果已经是可观察对象，则应返回observable参数", () => {
    const obs = observable();
    const obs2 = observable(obs);

    expect(obs === obs2).toBeTruthy();
  });

  test("当使用相同的参数重复调用时，应返回相同的可观察包装器", () => {
    const a = { a: 1 };
    const obs = observable(a);
    const obs2 = observable(a);

    expect(obs === obs2).toBeTruthy();
  });

  test("如果对象不可写，不应该包装成observable对象", () => {
    let dummy: number;
    const obj = {};
    Object.defineProperty(obj, "prop", {
      value: { num: 12 },
      writable: false,
      configurable: false,
    });
    const obs = observable(obj);
    observe(() => (dummy = obs.prop.num));
    expect(dummy).toEqual(12);
    (obj as any).prop.num = 13;
    expect(dummy).toEqual(12);
  });

  test("原始对象中不应该包含可观察对象", () => {
    const obj: any = {};
    const obs = observable(obj);
    obs.nested1 = {};
    obs.nested2 = observable();
    expect(isObservable(obj.nested1)).toBeFalsy();
    expect(isObservable(obj.nested2)).toBeFalsy();
    expect(isObservable(obs.nested1)).toBeFalsy();
    expect(isObservable(obs.nested2)).toBeTruthy();
  });

  test("observable包装的基本对象，isObservable返回true", () => {
    const a = { a: 1, b: 2 };
    const obs = observable(a);
    expect(isObservable(obs)).toBeTruthy();
  });

  test("primary对象，isObservable返回false", () => {
    const a = { a: 1, b: 2 };
    expect(isObservable(a)).toBeFalsy();
  });

  it("should observe delete operations", () => {
    let dummy;
    const obj = observable({ prop: "value" });
    observe(() => (dummy = obj.prop));

    expect(dummy).toEqual("value");
    delete obj.prop;
    expect(dummy).toEqual(undefined);
  });

  it("should observe has operations", () => {
    let dummy;
    const obj = observable({ prop: "value" });
    observe(() => (dummy = "prop" in obj));

    expect(dummy).toEqual(true);
    delete obj.prop;
    expect(dummy).toEqual(false);
    obj.prop = 12;
    expect(dummy).toEqual(true);
  });

  it("should observe properties on the prototype chain", () => {
    let dummy;
    const counter = observable({ num: 0 });
    const parentCounter = observable({ num: 2 });
    Object.setPrototypeOf(counter, parentCounter);
    observe(() => (dummy = counter.num));

    expect(dummy).toEqual(0);
    delete counter.num;
    expect(dummy).toEqual(2);
    parentCounter.num = 4;
    expect(dummy).toEqual(4);
    counter.num = 3;
    expect(dummy).toEqual(3);
  });

  it("should observe has operations on the prototype chain", () => {
    let dummy;
    const counter = observable({ num: 0 });
    const parentCounter = observable({ num: 2 });
    Object.setPrototypeOf(counter, parentCounter);
    observe(() => (dummy = "num" in counter));

    expect(dummy).toEqual(true);
    delete counter.num;
    expect(dummy).toEqual(true);
    delete parentCounter.num;
    expect(dummy).toEqual(false);
    counter.num = 3;
    expect(dummy).toEqual(true);
  });

  it("should observe inherited property accessors", () => {
    let dummy, parentDummy, hiddenValue;
    const obj = observable({});
    const parent = observable({
      set prop(value) {
        hiddenValue = value;
      },
      get prop() {
        return hiddenValue;
      },
    });
    Object.setPrototypeOf(obj, parent);
    observe(() => (dummy = obj.prop));
    observe(() => (parentDummy = parent.prop));

    expect(dummy).toEqual(undefined);
    expect(parentDummy).toEqual(undefined);
    obj.prop = 4;
    expect(dummy).toEqual(4);
    // this doesn't work, should it?
    // expect(parentDummy).toEqual(4)
    parent.prop = 2;
    expect(dummy).toEqual(2);
    expect(parentDummy).toEqual(2);
  });

  it("should observe function call chains", () => {
    let dummy;
    const counter = observable({ num: 0 });
    observe(() => (dummy = getNum()));

    function getNum() {
      return counter.num;
    }

    expect(dummy).toEqual(0);
    counter.num = 2;
    expect(dummy).toEqual(2);
  });

  it("should observe iteration", () => {
    let dummy;
    const list = observable(["Hello"]);
    observe(() => (dummy = list.join(" ")));

    expect(dummy).toEqual("Hello");
    list.push("World!");
    expect(dummy).toEqual("Hello World!");
    list.shift();
    expect(dummy).toEqual("World!");
  });

  it("should observe implicit array length changes", () => {
    let dummy;
    const list = observable(["Hello"]);
    observe(() => (dummy = list.join(" ")));

    expect(dummy).toEqual("Hello");
    list[1] = "World!";
    expect(dummy).toEqual("Hello World!");
    list[3] = "Hello!";
    expect(dummy).toEqual("Hello World!  Hello!");
  });

  it("should observe sparse array mutations", () => {
    let dummy;
    const list = observable([]);
    list[1] = "World!";
    observe(() => (dummy = list.join(" ")));

    expect(dummy).toEqual(" World!");
    list[0] = "Hello";
    expect(dummy).toEqual("Hello World!");
    list.pop();
    expect(dummy).toEqual("Hello");
  });

  it("should observe enumeration", () => {
    let dummy = 0;
    const numbers = observable({ num1: 3 });
    observe(() => {
      dummy = 0;
      for (let key in numbers) {
        dummy += numbers[key];
      }
    });

    expect(dummy).toEqual(3);
    numbers.num2 = 4;
    expect(dummy).toEqual(7);
    delete numbers.num1;
    expect(dummy).toEqual(4);
  });

  it("should observe symbol keyed properties", () => {
    const key = Symbol("symbol keyed prop");
    let dummy, hasDummy;
    const obj = observable({ [key]: "value" });
    observe(() => (dummy = obj[key]));
    observe(() => (hasDummy = key in obj));

    expect(dummy).toEqual("value");
    expect(hasDummy).toEqual(true);
    obj[key] = "newValue";
    expect(dummy).toEqual("newValue");
    delete obj[key];
    expect(dummy).toEqual(undefined);
    expect(hasDummy).toEqual(false);
  });

  it("should not observe well-known symbol keyed properties", () => {
    const key = Symbol.isConcatSpreadable;
    let dummy;
    const array = observable([]);
    observe(() => (dummy = array[key]));

    expect(array[key]).toEqual(undefined);
    expect(dummy).toEqual(undefined);
    array[key] = true;
    expect(array[key]).toEqual(true);
    expect(dummy).toEqual(undefined);
  });

  it("should observe function valued properties", () => {
    const oldFunc = () => {};
    const newFunc = () => {};

    let dummy;
    const obj = observable({ func: oldFunc });
    observe(() => (dummy = obj.func));

    expect(dummy).toEqual(oldFunc);
    obj.func = newFunc;
    expect(dummy).toEqual(newFunc);
  });

  it("should not observe set operations without a value change", () => {
    let hasDummy, getDummy;
    const obj = observable({ prop: "value" });

    const getSpy = jest.fn(() => (getDummy = obj.prop));
    const hasSpy = jest.fn(() => (hasDummy = "prop" in obj));
    observe(getSpy);
    observe(hasSpy);

    expect(getDummy).toEqual("value");
    expect(hasDummy).toEqual(true);
    obj.prop = "value";
    expect(getSpy).toBeCalledTimes(1);
    expect(hasSpy).toBeCalledTimes(1);
    expect(getDummy).toEqual("value");
    expect(hasDummy).toEqual(true);
  });

  it("should not observe raw mutations", () => {
    let dummy;
    const obj = observable();
    observe(() => (dummy = store.getRaw(obj).prop));

    expect(dummy).toEqual(undefined);
    obj.prop = "value";
    expect(dummy).toEqual(undefined);
  });

  it("should not be triggered by raw mutations", () => {
    let dummy;
    const obj = observable();
    observe(() => (dummy = obj.prop));

    expect(dummy).toEqual(undefined);
    store.getRaw(obj).prop = "value";
    expect(dummy).toEqual(undefined);
  });

  it("should not be triggered by inherited raw setters", () => {
    let dummy, parentDummy, hiddenValue;
    const obj = observable({});
    const parent = observable({
      set prop(value) {
        hiddenValue = value;
      },
      get prop() {
        return hiddenValue;
      },
    });
    Object.setPrototypeOf(obj, parent);
    observe(() => (dummy = obj.prop));
    observe(() => (parentDummy = parent.prop));

    expect(dummy).toEqual(undefined);
    expect(parentDummy).toEqual(undefined);
    store.getRaw(obj).prop = 4;
    expect(dummy).toEqual(undefined);
    expect(parentDummy).toEqual(undefined);
  });

  it("should avoid implicit infinite recursive loops with itself", () => {
    const counter = observable({ num: 0 });

    const counterSpy = jest.fn(() => counter.num++);
    observe(counterSpy);
    expect(counter.num).toEqual(1);
    expect(counterSpy).toBeCalledTimes(1);
    counter.num = 4;
    expect(counter.num).toEqual(5);
    expect(counterSpy).toBeCalledTimes(2);
  });

  it("should allow explicitly recursive raw function loops", () => {
    const counter = observable({ num: 0 });

    // TODO: this should be changed to reaction loops, can it be done?
    const numSpy = jest.fn(() => {
      counter.num++;
      if (counter.num < 10) {
        numSpy();
      }
    });
    observe(numSpy);

    expect(counter.num).toEqual(10);
    expect(numSpy).toBeCalledTimes(10);
  });

  it("should avoid infinite loops with other reactions", () => {
    const nums = observable({ num1: 0, num2: 1 });
    const globalObj: any = {
      fn1: jest.fn(() => (nums.num1 = nums.num2)),
      fn2: jest.fn(() => (nums.num2 = nums.num1)),
    };

    observe(globalObj.fn1);
    observe(globalObj.fn2);
    expect(nums.num1).toEqual(1);
    expect(nums.num2).toEqual(1);
    expect(globalObj.fn1).toBeCalledTimes(1);
    expect(globalObj.fn2).toBeCalledTimes(1);
    nums.num2 = 4;
    expect(nums.num1).toEqual(4);
    expect(nums.num2).toEqual(4);
    expect(globalObj.fn1).toBeCalledTimes(2);
    expect(globalObj.fn2).toBeCalledTimes(2);
    nums.num1 = 10;
    expect(nums.num1).toEqual(10);
    expect(nums.num2).toEqual(10);
    expect(globalObj.fn1).toBeCalledTimes(3);
    expect(globalObj.fn2).toBeCalledTimes(3);
  });

  it("should discover new branches while running automatically", () => {
    let dummy;
    const obj = observable({ prop: "value", run: false });

    const conditionalSpy = jest.fn(() => {
      dummy = obj.run ? obj.prop : "other";
    });
    observe(conditionalSpy);

    expect(dummy).toEqual("other");
    expect(conditionalSpy).toBeCalledTimes(1);
    obj.prop = "Hi";
    expect(dummy).toEqual("other");
    expect(conditionalSpy).toBeCalledTimes(1);
    obj.run = true;
    expect(dummy).toEqual("Hi");
    expect(conditionalSpy).toBeCalledTimes(2);
    obj.prop = "World";
    expect(dummy).toEqual("World");
    expect(conditionalSpy).toBeCalledTimes(3);
  });

  it("should not be triggered by mutating a property, which is used in an inactive branch", () => {
    let dummy;
    const obj = observable({ prop: "value", run: true });

    const conditionalSpy = jest.fn(() => {
      dummy = obj.run ? obj.prop : "other";
    });
    observe(conditionalSpy);

    expect(dummy).toEqual("value");
    expect(conditionalSpy).toBeCalledTimes(1);
    obj.run = false;
    expect(dummy).toEqual("other");
    expect(conditionalSpy).toBeCalledTimes(2);
    obj.prop = "value2";
    expect(dummy).toEqual("other");
    expect(conditionalSpy).toBeCalledTimes(2);
  });

  it("should not run multiple times for a single mutation", () => {
    let dummy;
    const obj = observable();
    const fnSpy = jest.fn(() => {
      for (const key in obj) {
        dummy = obj[key];
      }
      dummy = obj.prop;
    });
    observe(fnSpy);

    expect(fnSpy).toBeCalledTimes(1);
    obj.prop = 16;
    expect(dummy).toEqual(16);
    expect(fnSpy).toBeCalledTimes(2);
  });

  it("should allow nested reactions", () => {
    const nums = observable({ num1: 0, num2: 1, num3: 2 });
    const dummy: any = {};

    const childSpy = jest.fn(() => (dummy.num1 = nums.num1));

    const parentSpy = jest.fn(() => {
      dummy.num2 = nums.num2;

      observe(childSpy);
      dummy.num3 = nums.num3;
    });
    observe(parentSpy);

    expect(dummy).toEqual({ num1: 0, num2: 1, num3: 2 });
    expect(parentSpy).toBeCalledTimes(1);
    expect(childSpy).toBeCalledTimes(1);
    // this should only call the childReaction
    nums.num1 = 4;
    expect(dummy).toEqual({ num1: 4, num2: 1, num3: 2 });
    expect(parentSpy).toBeCalledTimes(1);
    expect(childSpy).toBeCalledTimes(2);
    // this calls the parentReaction, which calls the childReaction once
    nums.num2 = 10;
    expect(dummy).toEqual({ num1: 4, num2: 10, num3: 2 });
    expect(parentSpy).toBeCalledTimes(2);
    expect(childSpy).toBeCalledTimes(3);
    // this calls the parentReaction, which calls the childReaction once
    nums.num3 = 7;

    expect(dummy).toEqual({ num1: 4, num2: 10, num3: 7 });
    expect(parentSpy).toBeCalledTimes(3);
    expect(childSpy).toBeCalledTimes(4);
  });
});

describe("isObservable", () => {
  test("如果将observable作为参数传递，则应返回true", () => {
    const obs = observable();
    const isObs = isObservable(obs);
    expect(isObs).toBeTruthy();
  });

  test("如果将不可观察的参数作为参数传递，则应返回false", () => {
    const obj1 = { prop: "value" };
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
