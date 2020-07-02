import { TRaw, TProxy } from "./index.interface";
import Reaction from './reaction';

export const get = (target: any, prop: string | number | symbol, receiver: any) => {
 
  Reaction.register({ target, key: prop, receiver, type: 'get' });
  return Reflect.get(target, prop, receiver);
};


export const set = (target: any, prop: string | number | symbol, value: any, receiver: any) => {
  const oldValue = target[prop];
 
  try {
    if (Reflect.has(target, prop)) {
        
    } else {
       
    }
    
    Reflect.set(target, prop, value, receiver);
    Reaction.runningReactions({ target, key: prop, type: "set", receiver });
    return true;
  } catch (error) {
    
    return false;
  }
  
}

const handler:ProxyHandler<any> = {
  get,
  set
}

export default handler;
