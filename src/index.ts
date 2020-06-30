import observable, { isObservable } from "./observable";
import observe from "./observer";
import Store from "./internals";

const a = {a:11, 'c': 1, "d":2};
const b = {'c': 2};

const oba = observable(a);
observe(() => {
 
  oba.a++;
  console.log("out", oba.a);
  observe(() => {
    console.log("inner", oba.c);
    observe(() => {
      console.log("last", oba.d);
      
    });
  });
  console.log("out2");
});




