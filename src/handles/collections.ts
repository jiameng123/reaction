
import observable from "../observable";
import store from "../internals";
import Reaction from "../reaction";



function findObservable(obj:object ) {
    const observableObj = store.rawToProxy.get(obj);
    if(Reaction.hasRunningReactions() &&  typeof obj === "object" && obj != null) {
        if(observableObj) return observableObj;
        return observable(obj);
    }

    return observableObj || obj;
    
};

const getTargetAndProto = (proxyObj: object)  => {
  
    return {
        target:store.proxyToRaw.get(proxyObj) ,
        proto: Reflect.getPrototypeOf(proxyObj) as any
    }
};

//劫持Map|Set结构 返回的迭代器对象, 将value包装成obseverable对象,
const patchIterator = (it:Iterator<any>, isEntries = false) =>{
    const originItNext = it.next;
    it.next = () => {
        let { done, value} = originItNext.call(it);
      
        if(!done) {
            //如果调用的是entries方法，则包裹value[1]，entries返回的是[key, val]
            if(isEntries) {
                value[1] = findObservable(value[1]);
            } else {
                value = findObservable(value);
            }
       
        }

        return { done, value }
    }

    return it;
}

/**
 * @description 包装 Map | Set | WeakMap | WeakSet 结构 代理方法
 */
const collections =  {
    
    get(key: any)  {
        const { target, proto } = getTargetAndProto(this);
     
        Reaction.register({target, key, type:"get"});   
       
        return findObservable(proto.get.apply(target, arguments));        
    },

    set(key: any, value:any) {
        const { target, proto } = getTargetAndProto(this);
        const handKey = proto.has.call(target, key);
        const oldValue = proto.get.call(target,  key);
        const result = proto.set.apply(target, arguments);
      
        if(!handKey) {
            Reaction.runningReactions({target, key, type:"add", value});  
        } else {
         
           if(oldValue !== value) {
             Reaction.runningReactions({target, key, type:"set", value, oldValue});
           } 
        }
     
        return result;
    },

    has(key:any) {
        const { target , proto} = getTargetAndProto(this);
        Reaction.runningReactions({target, key, type:"has"});
        return proto.has.call(target, key);
    },

    add(key:any, value: any) {
        const { target, proto } = getTargetAndProto(this);
        const result = proto.add.apply(target, arguments);
        Reaction.runningReactions({target, key,  type:"add"});
        
        return result;
        
    },

    delete(key:any) {
        const { target, proto } = getTargetAndProto(this);
        const hadHkey = proto.has.call(target, key);
       
        const result =  proto.delete.apply(target, arguments);
        if(hadHkey) {
            Reaction.runningReactions({target, key, type: "delete"});
        }
    
        return result;
    },

    forEach(cb:Function, ...args ) {
        const { target, proto } = getTargetAndProto(this);
        Reaction.register({target, type:"iterate"});
        //包裹cb，forEach中获取的value 包裹成observeable对象传入用户的cb参数中来收集依赖
        const wrapCb = (value:any, ...rest ) => cb(findObservable(value), ...rest);
        proto.forEach.apply(target, wrapCb, ...args );
    },

    keys() {
        const { target, proto } = getTargetAndProto(this);
        Reaction.register({target, type:"iterate"});
        return proto.keys().apply(target);
    },

    // Map | Set 等结构 调取values 返回一个可迭代对象，这里做特殊处理
    values() {
        const { target, proto } = getTargetAndProto(this);
        Reaction.register({target, type:"iterate"});
        const it = proto.values().apply(target);
        return patchIterator(it);
    },

    get size() {
        const { target, proto } = getTargetAndProto(this);
        Reaction.register({target, type:"iterate"});
        return Reflect.get(proto, "size", target);
    },

    entries() {
        const { target, proto } = getTargetAndProto(this);
        Reaction.register({target, type:"iterate"});
        const it = proto.entries().apply(target);
        return patchIterator(it, true);
    },

    //for of 时 会调用[Symbol.iterator] 方法（迭代器）。
    [Symbol.iterator]() {
        const { target, proto } = getTargetAndProto(this);
        Reaction.register({target, type:"iterate"});
        const it = proto[Symbol.iterator].apply(target, arguments);
        //Map 结构 for of  会返回 和entries 一样的结构
        return patchIterator(it, target instanceof Map);
    }


}


export default {
    get(target, key, receiver) {
        target = Object.prototype.hasOwnProperty.call(collections, key)
        ? collections
        : target
      return Reflect.get(target, key, receiver)
    }
};

