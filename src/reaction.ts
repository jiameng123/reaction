import { IOperation } from './index.interface';
import store from './internals';


export type IFunc = (...args: any) => any;


export default class Reaction {

	private callback: IFunc = () => { };
	static stack: Array<Reaction> = [];
	private clearns: Array<Set<Reaction>> = [];

  	constructor(fn: IFunc) {
    	this.callback = fn;
  	}

  
	run() {
		
		if(Reaction.stack.indexOf(this) === -1) {
			this.release(this);
			try {
				Reaction.stack.push(this);
				this.callback();
			} catch (error) {
				 
			} finally {
				Reaction.stack.pop();
			}
		}
		
	}

    //如果当前reaction没有处于运行状态，重置Reaction cleanrs
	release(reaction:Reaction) {
		if(this.clearns.length) {
			this.clearns.forEach((reactionsForKey) => {
				reactionsForKey.delete(reaction);
			});
			reaction.clearns = [];
			
		}
	}

	//取消观察
	unObserve(reation?:Reaction) {
		this.release(reation || this);
	}

	//根据key注册reactions
	static register(operation: IOperation) {
		const [currentReaction] = Reaction.stack.slice(-1);
		if (currentReaction) {
			const { target, key } = operation;
			const reactionsForRaw = store.connection.get(target);
			let reactionsForKey = reactionsForRaw?.get(key);
			if (!reactionsForKey) reactionsForKey = new Set();
			reactionsForRaw?.set(key, reactionsForKey);

			if (!reactionsForKey.has(currentReaction)) {
				reactionsForKey.add(currentReaction);
				currentReaction.clearns.push(reactionsForKey);
				
			}

		}

	}

	static track(reactionsForKey:Set<Reaction>, target:Map<string|symbol|number, Set<Reaction>>, key:string|symbol|number) {
		const reactions = target.get(key);
		reactions && reactions.forEach(reactionsForKey.add, reactionsForKey);
	}
	

	//根据 object.prop 收集对应的观测函数  object.prop ---> reaction
	static getReactionsForOperation({ target, key, type }: IOperation):Set<Reaction> {
		const reactionsForRaw = store.connection.get(target) || new Map();
	
		const reactionsForKey = new Set<Reaction>();
		
		Reaction.track(reactionsForKey, reactionsForRaw,  Array.isArray(target) ? 'length' : key );
		
		return reactionsForKey;
	}
	
	//根据object.prop调用对应的观察函数
	static runningReactions({ target, key, type }: IOperation) {
		Reaction.getReactionsForOperation({ target, key, type }).forEach(reaction => reaction.run());
	}
}




