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

  	track() {
		Reaction.stack.forEach(reaction => reaction.callback());
	}
	  

	run() {
		
		if(Reaction.stack.indexOf(this) === -1) {
			this.release();
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
	release() {
		if(this.clearns.length) {
			this.clearns.forEach((reactionsForKey) => {
				reactionsForKey.delete(this);
			});
			this.clearns = [];
			
		}
	}

	//取消观察
	unObserve() {
		this.release();
	}

	//依赖收集
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

	//根据 object.prop 收集对应的观测函数  object.prop ---> reaction
	static getReactionsForOperation({ target, key, type }: IOperation):Set<Reaction> {
		const reactionsForRaw = store.connection.get(target);
		const reactionsForKey = reactionsForRaw?.get(key);
		const reactions = new Set<Reaction>();
		
		reactionsForKey?.forEach(reaction => {
			reactions.add(reaction);
		});
		return reactions;
	}
	
	//根据object.prop调用对应的观察函数
	static runningReactions({ target, key, type }: IOperation) {
		Reaction.getReactionsForOperation({ target, key, type }).forEach(reaction => {
			reaction.run();
		});
	}
}




