import { IOperation } from './index.interface';
import store from './internals';



export type IFunc = (...args: any) => any;


export default class Reaction {

	private callback: IFunc = () => { };
	static stack: Array<Reaction> = [];
	private clearns: Array<Set<Reaction>> = [];
	//迭代对象时自定义key
	static ITERATOR_KEY = Symbol("iteration key");

	protected unobserved:boolean = false;

  	constructor(fn: IFunc) {
    	this.callback = fn;
  	}

  
	run() {
		//如果已经取消 则直接运行
		if(this.unobserved) {
			return Reflect.apply(this.callback, this, arguments);
		}

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
		const _reaction = reation || this;
		if(!_reaction.unobserved) {
			_reaction.unobserved = true;
			this.release(reation || this);
		}
		
	}

	//根据key注册reactions
	static register(operation: IOperation) {
		const [currentReaction] = Reaction.stack.slice(-1);
		if (currentReaction) {
			let { target, key, type } = operation;
			
			// reactions callback 中访迭代访问对象key，通过自定义key ITERATOR_KEY与观察函数建立关联 exp:observe(() => for(var key in obj));
		 	if(type ==="iterate") key = Reaction.ITERATOR_KEY;

			const reactionsForRaw = store.connection.get(target);
			let reactionsForKey = reactionsForRaw?.get(key as any);
			
			if (!reactionsForKey) {
				reactionsForKey = new Set();
				reactionsForRaw?.set(key as any, reactionsForKey);
			}

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

		if(type === "clear") {
			reactionsForRaw.forEach((_, key) => {
				Reaction.track(reactionsForKey, reactionsForRaw, key);
			});

		} else {
			key &&  Reaction.track(reactionsForKey, reactionsForRaw, key);
		}
		

		if(type === "add" || type === "delete" || type === "clear") {
			
			Reaction.track(reactionsForKey, reactionsForRaw, Array.isArray(target) ? 'length' :  Reaction.ITERATOR_KEY);
		}

		return reactionsForKey;
	}
	
	//根据object.prop调用对应的观察函数
	static runningReactions({ target, key, type }: IOperation) {
		Reaction.getReactionsForOperation({ target, key, type }).forEach(reaction => reaction.run());
	}

	static hasRunningReactions() {
		return Reaction.stack.length > 0;
	}
}




