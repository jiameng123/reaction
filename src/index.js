const { observable , observe } = require("@nx-js/observer-util");
const a = observable({ a: 1, c: 2 , d:[]});

observe(() => {
  a.c++;
  console.log("out", a.a);
  observe(() => {
    console.log("inner", a.c);
    observe(() => {
      console.log("last", a.d);
      
    });
  });
   console.log("out2", a.a);
});
a.c++;






