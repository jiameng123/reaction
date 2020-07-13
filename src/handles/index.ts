
import collectionHandlers  from "./collections";
import baseHandles from "./base";

const handlers = new Map<any, any>([
    [Map, collectionHandlers ],
    [Set, collectionHandlers ],
    [WeakMap, collectionHandlers ],
    [WeakSet, collectionHandlers ],
    [Object, false],
    [Array, false],
    [Int8Array, false],
    [Uint8Array, false],
    [Uint8ClampedArray, false],
    [Int16Array, false],
    [Uint16Array, false],
    [Int32Array, false],
    [Uint32Array, false],
    [Float32Array, false],
    [Float64Array, false]
]);


const globalObj = typeof window === "object" ? window : Function('return this')();


export const shouldInstrument = ({constructor}:object) => {
    //是否是内置对象
   const isBuiltIn =  typeof constructor === "function"
    && constructor.name in globalObj
    && globalObj[constructor.name] === constructor;

    return !isBuiltIn || handlers.has(constructor);
}

export default function getHandles(obj:any) {
   return  handlers.get(obj.constructor) || baseHandles ;
}

