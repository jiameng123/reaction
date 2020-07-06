import { IOperation } from './index.interface';
import Store from './internals';


export type IFunc = (...args: any) => any;


export default class Reaction {

	private callback: IFunc = () => { };
	static stack: Array<Reaction> = [];
	static clearns:Array<Set<any>> = [];

  	constructor(fn: IFunc) {
    	this.callback = fn;
  	}

  	track() {
		Reaction.stack.forEach(reaction => reaction.callback());
  	}

	run() {
	
		if(Reaction.stack.indexOf(this) === -1) {
			
			if(Reaction.clearns.length) {
				Reaction.clearns.forEach((reactionsForKey) => {
					reactionsForKey.delete(this);
				});
				Reaction.clearns = [];
			}

			try {
				Reaction.stack.push(this);
				this.callback();
			} catch (error) {
				 
			} finally {
				Reaction.stack.pop();
			}
		}
		
	}

	//取消观察
	unObserve() {
	
		Reaction.clearns.forEach( reaction => {
			reaction.delete(this);
		});
	}

	//依赖收集
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
				Reaction.clearns.push(reactionsForKey);
				
			}
		
		}

	}

	static getReactionsForOperation({ target, key, type }: IOperation):Set<Reaction> {
		const reactionsForRaw = Store.connection.get(target);
		const reactionsForKey = reactionsForRaw?.get(key);
		const reactions = new Set<Reaction>();
		
		reactionsForKey?.forEach(reaction => {
			reactions.add(reaction);
		});
		return reactions;
	}
	
	static runningReactions({ target, key, type }: IOperation) {
		Reaction.getReactionsForOperation({ target, key, type }).forEach(reaction => {
			reaction.run();
		});
	}
}




