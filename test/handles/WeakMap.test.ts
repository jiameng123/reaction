import { observable, isObservable, observe } from "../../src/index";
import store from "../../src/internals";

describe("WeakMap", () => {
  it("should be a proper JS WeakMap", () => {
    const map = observable(new WeakMap());
    expect(map).toBeInstanceOf(WeakMap);
    expect(store.getRaw(map)).toBeInstanceOf(WeakMap);
  });

  it("should observe mutations", () => {
    let dummy;
    const key = {};
    const map = observable(new WeakMap());
    observe(() => (dummy = map.get(key)));

    expect(dummy).toEqual(undefined);
    map.set(key, "value");
    expect(dummy).toEqual("value");
    map.set(key, "value2");
    expect(dummy).toEqual("value2");
    map.delete(key);
    expect(dummy).toEqual(undefined);
  });

  it("should not observe custom property mutations", () => {
    let dummy;
    const map = observable(new WeakMap());
    observe(() => (dummy = map.customProp));

    expect(dummy).toEqual(undefined);
    map.customProp = "Hello World";
    expect(dummy).toEqual(undefined);
  });

  it("should not observe non value changing mutations", () => {
    let dummy;
    const key = {};
    const map = observable(new WeakMap());
    const mapSpy = jest.fn(() => (dummy = map.get(key)));
    observe(mapSpy);

    expect(dummy).toEqual(undefined);
    expect(mapSpy).toBeCalledTimes(1);
    map.set(key, "value");
    expect(dummy).toEqual("value");
    expect(mapSpy).toBeCalledTimes(2);
    map.set(key, "value");
    expect(dummy).toEqual("value");
    expect(mapSpy).toBeCalledTimes(2);
    map.delete(key);
    expect(dummy).toEqual(undefined);
    expect(mapSpy).toBeCalledTimes(3);
    map.delete(key);
    expect(dummy).toEqual(undefined);
    expect(mapSpy).toBeCalledTimes(3);
  });

  it("should not observe raw data", () => {
    const key = {};
    let dummy;
    const map = observable(new WeakMap());
    observe(() => (dummy = store.getRaw(map).get(key)));

    expect(dummy).toEqual(undefined);
    map.set(key, "Hello");
    expect(dummy).toEqual(undefined);
    map.delete(key);
    expect(dummy).toEqual(undefined);
  });

  it("should not be triggered by raw mutations", () => {
    const key = {};
    let dummy;
    const map = observable(new WeakMap());
    observe(() => (dummy = map.get(key)));

    expect(dummy).toEqual(undefined);
    store.getRaw(map).set(key, "Hello");
    expect(dummy).toEqual(undefined);
    store.getRaw(map).delete(key);
    expect(dummy).toEqual(undefined);
  });

  it("should wrap object values with observables when requested from a reaction", () => {
    const key = {};
    const key2 = {};
    const map = observable(new Map());
    map.set(key, {});
    map.set(key2, {});

    expect(isObservable(map.get(key))).toBeFalsy();
    expect(isObservable(map.get(key2))).toBeFalsy();
    observe(() => expect(isObservable(map.get(key))).toBeTruthy());
    expect(isObservable(map.get(key))).toBeTruthy();
    expect(isObservable(map.get(key2))).toBeFalsy();
  });
});
