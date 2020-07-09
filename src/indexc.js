const { observable , observe } = require("@nx-js/observer-util");
const oObj = observable( [2]);

const a = [1,2];

const pa = new Proxy(a, {
  get(target, key, re) {
    console.log("get---->",target, key);
    return target[key]
  },
  set(target, key, value) {
  
    return target[key]  = value;
  }

});

pa.map(v =>  console.log(v))







