import { observable, isObservable, observe } from "../../src/index";
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

    observe(() => (dummy = map.get("key")));
    expect(dummy).toBeUndefined();
    map.set("key", "value");
    expect(dummy).toEqual("value");
    map.set("key", "value2");
    expect(dummy).toEqual("value2");
    map.delete("key");
    expect(dummy).toBeUndefined();
  });

  test("应该观察size改变", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => (dummy = map.size));

    expect(dummy).toBe(0);
    map.set("key1", "value");
    map.set("key2", "value2");
    expect(dummy).toEqual(2);
    map.delete("key1");
    expect(dummy).toEqual(1);
    map.clear();
    expect(dummy).toEqual(0);
  });

  test("应该可以观察可迭代对象", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => {
      dummy = 0;

      for (let [key, num] of map) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    map.set("key0", 3);
    expect(dummy).toEqual(3);
    map.set("key1", 2);
    expect(dummy).toEqual(5);
    map.delete("key0");
    expect(dummy).toEqual(2);
    map.clear();
    expect(dummy).toEqual(0);
  });

  test("应该能够观察forEach", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => {
      dummy = 0;
      map.forEach((num) => (dummy += num));
    });

    expect(dummy).toEqual(0);
    map.set("key0", 3);
    expect(dummy).toEqual(3);

    map.set("key1", 2);
    expect(dummy).toEqual(5);
    map.delete("key0");
    expect(dummy).toEqual(2);
    map.clear();
    expect(dummy).toEqual(0);
  });

  test("keys方法应该被观察", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => {
      dummy = 0;
      for (let key of map.keys()) {
        dummy += key;
      }
    });

    expect(dummy).toEqual(0);
    map.set(3, 3);
    expect(dummy).toEqual(3);
    map.set(2, 2);
    expect(dummy).toEqual(5);
    map.delete(3);
    expect(dummy).toEqual(2);
    map.clear();
    expect(dummy).toEqual(0);
  });

  test("values方法应被观察", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => {
      dummy = 0;
      for (let num of map.values()) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    map.set("key0", 3);
    expect(dummy).toEqual(3);
    map.set("key1", 2);
    expect(dummy).toEqual(5);
    map.delete("key0");
    expect(dummy).toEqual(2);
    map.clear();
    expect(dummy).toEqual(0);
  });

  test("entries应该能够被观察", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => {
      dummy = 0;

      for (let [key, num] of map.entries()) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    map.set("key0", 3);
    expect(dummy).toEqual(3);
    map.set("key1", 2);
    expect(dummy).toEqual(5);
    map.delete("key0");
    expect(dummy).toEqual(2);
    map.clear();
    expect(dummy).toEqual(0);
  });

  test("应该通过clears方法触发", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => (dummy = map.get("key")));

    expect(dummy).toEqual(undefined);
    map.set("key", 3);
    expect(dummy).toEqual(3);
    map.clear();
    expect(dummy).toEqual(undefined);
  });

  test("自定义属性不应触发reactions", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => (dummy = map.customProp));

    expect(dummy).toEqual(undefined);
    map.customProp = "Hello World";
    expect(dummy).toEqual(undefined);
  });

  test("不应该观察非observeable包裹的对象", () => {
    let dummy;
    const map = observable(new Map());
    const mapSpy = jest.fn(() => (dummy = map.get("key")));
    observe(mapSpy);

    expect(dummy).toEqual(undefined);
    expect(mapSpy).toBeCalledTimes(1);
    map.set("key", "value");
    expect(dummy).toEqual("value");
    expect(mapSpy).toBeCalledTimes(2);
    map.set("key", "value");
    expect(dummy).toEqual("value");
    expect(mapSpy).toBeCalledTimes(2);
    map.delete("key");
    expect(dummy).toEqual(undefined);
    expect(mapSpy).toBeCalledTimes(3);
    map.delete("key");
    expect(dummy).toEqual(undefined);
    expect(mapSpy).toBeCalledTimes(3);
    map.clear();
    expect(dummy).toEqual(undefined);
    expect(mapSpy).toBeCalledTimes(3);
  });

  test("不应该观察store.getRaw数据", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => (dummy = store.getRaw(map).get("key")));

    expect(dummy).toEqual(undefined);
    map.set("key", "Hello");
    expect(dummy).toEqual(undefined);
    map.delete("key");
    expect(dummy).toEqual(undefined);
  });

  test("store.getRaw获取源数据的迭代方法不应被观察", () => {
    let dummy = 0;
    const map = observable(new Map());
    observe(() => {
      dummy = 0;

      for (let [key, num] of store.getRaw(map).entries()) {
        dummy += num;
      }

      for (let key of store.getRaw(map).keys()) {
        dummy += store.getRaw(map).get(key);
      }

      for (let num of store.getRaw(map).values()) {
        dummy += num;
      }

      store.getRaw(map).forEach((num, key) => {
        dummy += num;
      });

      for (let [key, num] of store.getRaw(map)) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    map.set("key1", 2);
    map.set("key2", 3);
    expect(dummy).toEqual(0);
    map.delete("key1");
    expect(dummy).toEqual(0);
  });

  test("不应由store.getRaw触发reactions", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => (dummy = map.get("key")));

    expect(dummy).toEqual(undefined);
    store.getRaw(map).set("key", "Hello");
    expect(dummy).toEqual(undefined);
    dummy = "Thing";
    store.getRaw(map).delete("key");
    expect(dummy).toEqual("Thing");
    store.getRaw(map).clear();
    expect(dummy).toEqual("Thing");
  });

  test("不应该观察store.getRaw属性改变", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => (dummy = store.getRaw(map).size));

    expect(dummy).toEqual(0);
    map.set("key", "value");
    expect(dummy).toEqual(0);
  });

  test("不应由store.getRaw元数据改变触发reactions", () => {
    let dummy;
    const map = observable(new Map());
    observe(() => (dummy = map.size));

    expect(dummy).toEqual(0);
    store.getRaw(map).set("key", "value");
    expect(dummy).toEqual(0);
  });

  test("应该支持对象作为键", () => {
    let dummy;
    const key = {};
    const map = observable(new Map());
    const mapSpy = jest.fn(() => (dummy = map.get(key)));
    observe(mapSpy);

    expect(dummy).toEqual(undefined);
    expect(mapSpy).toBeCalledTimes(1);

    map.set(key, 1);
    expect(dummy).toEqual(1);
    expect(mapSpy).toBeCalledTimes(2);

    map.set({}, 2);
    expect(dummy).toEqual(1);
    expect(mapSpy).toBeCalledTimes(2);
  });

  test("map设置value为普通对象，应使用可观察对象包装对象值", () => {
    const map = observable(new Map());
    map.set("key", {});
    map.set("key2", {});

    expect(isObservable(map.get("key"))).toBeFalsy();
    expect(isObservable(map.get("key2"))).toBeFalsy();
    observe(() => expect(isObservable(map.get("key"))).toBeTruthy());
    expect(isObservable(map.get("key"))).toBeTruthy();
    expect(isObservable(map.get("key2"))).toBeFalsy();
  });

  test("可观察对象迭代，应使用可观察对象包装对象值", () => {
    const map = observable(new Map());
    map.set("key", {});

    map.forEach((value) => expect(isObservable(value)).toBeFalsy());
    for (let [key, value] of map) {
      expect(isObservable(value)).toBeFalsy();
    }

    for (let [key, value] of map.entries()) {
      expect(isObservable(value)).toBeFalsy();
    }

    for (let value of map.values()) {
      expect(isObservable(value)).toBeFalsy();
    }

    observe(() => {
      map.forEach((value) => expect(isObservable(value)).toBeTruthy());
      for (let [key, value] of map) {
        expect(isObservable(value)).toBeTruthy();
      }

      for (let [key, value] of map.entries()) {
        expect(isObservable(value)).toBeTruthy();
      }

      for (let value of map.values()) {
        expect(isObservable(value)).toBeTruthy();
      }
    });

    map.forEach((value) => expect(isObservable(value)).toBeTruthy());
    for (let [key, value] of map) {
      expect(isObservable(value)).toBeTruthy();
    }

    for (let [key, value] of map.entries()) {
      expect(isObservable(value)).toBeTruthy();
    }

    for (let value of map.values()) {
      expect(isObservable(value)).toBeTruthy();
    }
  });
});
