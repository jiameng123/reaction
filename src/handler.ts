import { TRaw, TReactiveProxy } from "./index.interface";

export const get = (target: any, prop: string | number | symbol, receiver: any) => {
  
  return Reflect.get(target, prop, receiver);
};


export const set = (target: any, prop: string | number | symbol, value: any, receiver: any) => {
  const oldValue = target[prop];
  
  try {
    if (Reflect.has(target, prop)) {
        
    } else {
       
    }
   
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
