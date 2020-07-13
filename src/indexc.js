const { observable , observe } = require("@nx-js/observer-util");
const oObj = observable( [2]);

const a = new Map([[1, 2]]);

const pa = new Proxy(a, {
  get(target, key, re) {
  
    return target[key]
  },
  set(target, key, value) {
  
    return target[key]  = value;
  },
  


});

a.delete(1);
console.log(a);





