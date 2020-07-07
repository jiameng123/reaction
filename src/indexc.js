const { observable , observe } = require("@nx-js/observer-util");
const oObj = observable( {a:1, b:2, c:3});

observe(() => {
  oObj.a++;
  console.log(oObj.a);
});
observe(() => {
  console.log(oObj.a, "222222");
});

observe(() => {
    
  console.log(oObj.b);
 
});
oObj.b++;
oObj.a++;







