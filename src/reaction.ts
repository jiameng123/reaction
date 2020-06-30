import { IOperation } from './index.interface';
import Store from './internals';


export type IFunc = (...args: any) => any;


export default class Reaction {

	private callback: IFunc = () => { };
	static stack: Array<Reaction> = [];

  	constructor(fn: IFunc) {
    	this.callback = fn;
  	}

  	track(callabck: IFunc) {
  
  	}

	run() {
		try {
			Reaction.stack.push(this);
			this.callback();
		
		} catch (error) {
		
    } finally {
     
			Reaction.stack.pop();
    }
     console.log(Reaction.stack, "sss")

	}

	unObserve() {

	}

	static register(operation: IOperation) {
		const [currentReaction] = Reaction.stack.slice(-1);
		if (currentReaction) {
			const { target, key } = operation;
			const reactionsForRaw = Store.connection.get(target);
			let reactionsForKey = reactionsForRaw?.get(key);
			if (!reactionsForKey) reactionsForKey = new Set();
			reactionsForRaw?.set(key, reactionsForKey);

			if (!reactionsForKey.has(currentReaction)) {
				reactionsForKey.add(currentReaction);
			}
		
		}

	}

	static getReactionsForOperation({ target, key, type }: IOperation):Set<Reaction> {
		const reactionsForRaw = Store.connection.get(target);
    const reactionsForKey = reactionsForRaw?.get(key);
		const reactions = new Set<Reaction>();
		reactionsForKey?.forEach(reaction => reactions.add(reaction));
		return reactions;
	}
	
	static runningReactions({ target, key, type }: IOperation) {
		Reaction.getReactionsForOperation({ target, key, type }).forEach(reaction => reaction.run());
	}
}




