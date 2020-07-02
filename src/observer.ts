import Reaction, { IFunc } from "./reaction";
import Store from "./internals";
import { getRaw } from "./observable";
const observer = (fn:IFunc) => {
  const reaction = new Reaction(fn);
  reaction.run();
  return reaction.unObserve;

}

export default observer;
