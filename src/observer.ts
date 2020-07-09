import Reaction, { IFunc } from "./reaction";

const observer = (fn:IFunc): ()=> void => {
  const reaction = new Reaction(fn);
  reaction.run();
  return reaction.unObserve.bind(reaction);

}

export default observer;
