import { isObject } from "./help";
import store from "./internals";
import Reaction from './reaction';
import observable from './observable';

export const get = (target: object, prop: string | number | symbol, receiver: any) => {
  
  const result = Reflect.get(target, prop, receiver);
  
  if(typeof prop === "symbol") return result;

  Reaction.register({ target, key: prop, receiver, type: 'get' });
  const observableResult = store.rawToProxy.get(result);
  
  if(result != null && isObject(result)) {
      if(observableResult) return observableResult;

      const descriptor = Reflect.getOwnPropertyDescriptor(result, prop);

      if(descriptor) {
        if(descriptor.writable || descriptor.configurable) {
          return observable(result);
        }
      } 
  }

  return observableResult || result;
};


export const set = (target: object, prop: string | number | symbol, value: any, receiver: any) => {
  const oldValue = target[prop];
  const hasProp = Object.prototype.hasOwnProperty.call(target, prop);
  
  try {
    Reflect.set(target, prop, value, receiver);
    const type = hasProp && oldValue !== value ? "set" : "add";
   
    Reaction.runningReactions({ target, key: prop, type, receiver });
   
    return true;
  } catch (error) {
    
    return false;
  }
  
}

export const deleteProperty  = (target:object, prop: string | number | symbol) => {
    const hasProp = Object.prototype.hasOwnProperty.call(target, prop);
    const result = Reflect.deleteProperty(target, prop);
  
    if(hasProp) {
      Reaction.runningReactions({ target, key: prop, type: "delete", value: target[prop] });
    }
   
    return result;
}

export const has = (target:object, prop:string| number |symbol) => {

  Reaction.register({target, key: prop, type: "has"});
  return Reflect.has(target, prop);

}


export const ownKeys = (target:object) => {
  Reaction.register({target, type: "iterate" });
  return Reflect.ownKeys(target);
}

const handler = {
  get,
  set,
  has,
  deleteProperty,
  ownKeys
}

export default handler;
