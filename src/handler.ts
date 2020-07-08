import { TRaw, TProxy } from "./index.interface";
import Reaction from './reaction';

export const get = (target: any, prop: string | number | symbol, receiver: any) => {
 
  Reaction.register({ target, key: prop, receiver, type: 'get' });
  return Reflect.get(target, prop, receiver);
};


export const set = (target: any, prop: string | number | symbol, value: any, receiver: any) => {
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

const handler = {
  get,
  set,
  deleteProperty
}

export default handler;
