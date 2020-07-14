import { observable, isObservable, observe } from "../../src/index";
import store from "../../src/internals";

describe("Set", () => {
  it("should be a proper JS Set", () => {
    const set = observable(new Set());

    expect(set).toBeInstanceOf(Set);
    expect(store.getRaw(set)).toBeInstanceOf(Set);
  });

  it("should observe mutations", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => (dummy = set.has("value")));

    expect(dummy).toEqual(false);
    set.add("value");
    expect(dummy).toEqual(true);
    set.delete("value");
    expect(dummy).toEqual(false);
  });

  it("should observe for of iteration", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => {
      dummy = 0;
      for (let num of set) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    set.add(2);
    set.add(1);
    expect(dummy).toEqual(3);
    set.delete(2);
    expect(dummy).toEqual(1);
    set.clear();
    expect(dummy).toEqual(0);
  });

  it("should observe forEach iteration", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => {
      dummy = 0;
      set.forEach((num) => (dummy += num));
    });

    expect(dummy).toEqual(0);
    set.add(2);
    set.add(1);
    expect(dummy).toEqual(3);
    set.delete(2);
    expect(dummy).toEqual(1);
    set.clear();
    expect(dummy).toEqual(0);
  });

  it("should observe values iteration", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => {
      dummy = 0;
      for (let num of set.values()) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    set.add(2);
    set.add(1);
    expect(dummy).toEqual(3);
    set.delete(2);
    expect(dummy).toEqual(1);
    set.clear();
    expect(dummy).toEqual(0);
  });

  it("should observe keys iteration", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => {
      dummy = 0;
      for (let num of set.keys()) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    set.add(2);
    set.add(1);
    expect(dummy).toEqual(3);
    set.delete(2);
    expect(dummy).toEqual(1);
    set.clear();
    expect(dummy).toEqual(0);
  });

  it("should observe entries iteration", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => {
      dummy = 0;
      // eslint-disable-next-line no-unused-vars
      for (let [key, num] of set.entries()) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    set.add(2);
    set.add(1);
    expect(dummy).toEqual(3);
    set.delete(2);
    expect(dummy).toEqual(1);
    set.clear();
    expect(dummy).toEqual(0);
  });

  it("should be triggered by clearing", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => (dummy = set.has("key")));

    expect(dummy).toEqual(false);
    set.add("key");
    expect(dummy).toEqual(true);
    set.clear();
    expect(dummy).toEqual(false);
  });

  it("should not observe custom property mutations", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => (dummy = set.customProp));

    expect(dummy).toEqual(undefined);
    set.customProp = "Hello World";
    expect(dummy).toEqual(undefined);
  });

  it("should observe size mutations", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => (dummy = set.size));

    expect(dummy).toEqual(0);
    set.add("value");
    set.add("value2");
    expect(dummy).toEqual(2);
    set.delete("value");
    expect(dummy).toEqual(1);
    set.clear();
    expect(dummy).toEqual(0);
  });

  it("should not observe non value changing mutations", () => {
    let dummy;
    const set = observable(new Set());
    const setSpy = jest.fn(() => (dummy = set.has("value")));
    observe(setSpy);

    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(1);
    set.add("value");
    expect(dummy).toEqual(true);
    expect(setSpy).toBeCalledTimes(2);
    set.add("value");
    expect(dummy).toEqual(true);
    expect(setSpy).toBeCalledTimes(2);
    set.delete("value");
    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(3);
    set.delete("value");
    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(3);
    set.clear();
    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(3);
  });

  it("should not observe raw data", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => (dummy = store.getRaw(set).has("value")));

    expect(dummy).toEqual(false);
    set.add("value");
    expect(dummy).toEqual(false);
  });

  it("should not observe raw iterations", () => {
    let dummy = 0;
    const set = observable(new Set());
    observe(() => {
      dummy = 0;
      for (let [num] of store.getRaw(set).entries()) {
        dummy += num;
      }
      for (let num of store.getRaw(set).keys()) {
        dummy += num;
      }
      for (let num of store.getRaw(set).values()) {
        dummy += num;
      }
      store.getRaw(set).forEach((num) => {
        dummy += num;
      });
      for (let num of store.getRaw(set)) {
        dummy += num;
      }
    });

    expect(dummy).toEqual(0);
    set.add(2);
    set.add(3);
    expect(dummy).toEqual(0);
    set.delete(2);
    expect(dummy).toEqual(0);
  });

  it("should not be triggered by raw mutations", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => (dummy = set.has("value")));

    expect(dummy).toEqual(false);
    store.getRaw(set).add("value");
    expect(dummy).toEqual(false);
    dummy = true;
    store.getRaw(set).delete("value");
    expect(dummy).toEqual(true);
    store.getRaw(set).clear();
    expect(dummy).toEqual(true);
  });

  it("should not observe raw size mutations", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => (dummy = store.getRaw(set).size));

    expect(dummy).toEqual(0);
    set.add("value");
    expect(dummy).toEqual(0);
  });

  it("should not be triggered by raw size mutations", () => {
    let dummy;
    const set = observable(new Set());
    observe(() => (dummy = set.size));

    expect(dummy).toEqual(0);
    store.getRaw(set).add("value");
    expect(dummy).toEqual(0);
  });

  it("should support objects as key", () => {
    let dummy;
    const key = {};
    const set = observable(new Set());
    const setSpy = jest.fn(() => (dummy = set.has(key)));
    observe(setSpy);

    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(1);

    set.add({});
    expect(dummy).toEqual(false);
    expect(setSpy).toBeCalledTimes(1);

    set.add(key);
    expect(dummy).toEqual(true);
    expect(setSpy).toBeCalledTimes(2);
  });

  it("should wrap object values with observables when iterated from a reaction", () => {
    const set = observable(new Set());
    set.add({});

    set.forEach((value) => expect(isObservable(value)).toBeFalsy());
    for (let value of set) {
      expect(isObservable(value)).toBeFalsy();
    }
    for (let [_, value] of set.entries()) {
      expect(isObservable(value)).toBeFalsy();
    }
    for (let value of set.values()) {
      expect(isObservable(value)).toBeFalsy();
    }

    observe(() => {
      set.forEach((value) => expect(isObservable(value)).toBeTruthy());
      for (let value of set) {
        expect(isObservable(value)).toBeTruthy();
      }
      for (let [_, value] of set.entries()) {
        expect(isObservable(value)).toBeTruthy();
      }
      for (let value of set.values()) {
        expect(isObservable(value)).toBeTruthy();
      }
    });

    set.forEach((value) => expect(isObservable(value)).toBeTruthy());
    for (let value of set) {
      expect(isObservable(value)).toBeTruthy();
    }
    for (let [_, value] of set.entries()) {
      expect(isObservable(value)).toBeTruthy();
    }
    for (let value of set.values()) {
      expect(isObservable(value)).toBeTruthy();
    }
  });
});
