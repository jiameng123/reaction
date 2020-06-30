import Reaction, { IFunc } from "./reaction";

const observer = (fn:IFunc) => {
  const reaction = new Reaction(fn);
  reaction.run();
  return reaction.unObserve;
}

export default observer;
