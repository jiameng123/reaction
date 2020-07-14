import { observable, isObservable, observe } from "../../src/index";
import store from "../../src/internals";

describe("WeakSet", () => {
  it("should be a proper JS WeakSet", () => {
    const set = observable(new WeakSet());
    expect(set).toBeInstanceOf(WeakSet);
    expect(store.getRaw(set)).toBeInstanceOf(WeakSet);
  });

  it("should observe mutations", () => {
    let dummy;
    const value = {};
    const set = observable(new WeakSet());
    observe(() => (dummy = set.has(value)));

    expect(dummy).toEqual(false);
    set.add(value);
    expect(dummy).toEqual(true);
    set.delete(value);
    expect(dummy).toEqual(false);
  });

  it("should not observe custom property mutations", () => {
    let dummy;
    const set = observable(new WeakSet());
    observe(() => (dummy = set.customProp));

    expect(dummy).toEqual(undefined);
    set.customProp = "Hello World";
    expect(dummy).toEqual(undefined);
  });

  it("should not observe non value changing mutations", () => {
    let dummy;
    const value = {};
    const set = observable(new WeakSet());
    const setSpy = jest.fn(() => (dummy = set.has(value)));
    observe(setSpy);

    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(1);
    set.add(value);
    expect(dummy).toEqual(true);
    expect(setSpy).toBeCalledTimes(2);
    set.add(value);
    expect(dummy).toEqual(true);
    expect(setSpy).toBeCalledTimes(2);
    set.delete(value);
    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(3);
    set.delete(value);
    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(3);
  });

  it("should not observe raw data", () => {
    const value = {};
    let dummy;
    const set = observable(new WeakSet());
    observe(() => (dummy = store.getRaw(set).has(value)));

    expect(dummy).toEqual(false);
    set.add(value);
    expect(dummy).toEqual(false);
  });

  it("should not be triggered by raw mutations", () => {
    const value = {};
    let dummy;
    const set = observable(new WeakSet());
    observe(() => (dummy = set.has(value)));

    expect(dummy).toEqual(false);
    store.getRaw(set).add(value);
    expect(dummy).toEqual(false);
  });
});
