import { isObject } from "../help";
import store from "../internals";
import Reaction from "../reaction";
import observable from "../observable";

const wellKnownSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map((key) => Symbol[key])
    .filter((value) => typeof value === "symbol")
);

export const get = (
  target: object,
  prop: string | number | symbol,
  receiver: any
) => {
  const result = Reflect.get(target, prop, receiver);

  if (typeof prop === "symbol" && wellKnownSymbols.has(prop)) return result;

  Reaction.register({ target, key: prop, receiver, type: "get" });
  const observableResult = store.rawToProxy.get(result);

  //如果result是一个对象，并且 target 已经被包装，则包装result对象
  if (Reaction.hasRunningReactions() && result != null && isObject(result)) {
    // if(observableResult) return observableResult;

    const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

    if (
      !descriptor ||
      !(descriptor.writable === false && descriptor.configurable === false)
    ) {
      return observable(result);
    }
  }

  return observableResult || result;
};

export const set = (
  target: object,
  prop: string | number | symbol,
  value: any,
  receiver: any
) => {
  const oldValue = target[prop];
  const hasProp = Object.prototype.hasOwnProperty.call(target, prop);

  if (typeof value === "object" && value != null) {
    value = store.proxyToRaw.get(value) || value;
  }

  const result = Reflect.set(target, prop, value, receiver);

  if (target !== store.getRaw(receiver)) {
    return result;
  }

  if (!hasProp) {
    Reaction.runningReactions({ target, key: prop, type: "add", receiver });
  } else if (value !== oldValue) {
    Reaction.runningReactions({ target, key: prop, type: "set", receiver });
  }

  return result;
};

export const deleteProperty = (
  target: object,
  prop: string | number | symbol
) => {
  const hasProp = Object.prototype.hasOwnProperty.call(target, prop);
  const result = Reflect.deleteProperty(target, prop);

  if (hasProp) {
    Reaction.runningReactions({
      target,
      key: prop,
      type: "delete",
      value: target[prop],
    });
  }

  return result;
};

export const has = (target: object, prop: string | number | symbol) => {
  Reaction.register({ target, key: prop, type: "has" });
  return Reflect.has(target, prop);
};

export const ownKeys = (target: object) => {
  Reaction.register({ target, type: "iterate" });
  return Reflect.ownKeys(target);
};

const handler = {
  get,
  set,
  has,
  deleteProperty,
  ownKeys,
};

export default handler;
