const { observable , observe } = require("@nx-js/observer-util");
const oObj = observable( []);

observe(() => {
 
  console.log(oObj);
});

oObj.push(1);








