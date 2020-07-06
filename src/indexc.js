const { observable , observe } = require("@nx-js/observer-util");
const oObj = observable( {a:1, b:2, c:3});

observe(() => {
  oObj.a++;
  observe(() => {
      oObj.b++;
      observe(() => {
          oObj.c++; 
      });
  });
});
oObj.b++;
console.log(oObj.c,'s');






