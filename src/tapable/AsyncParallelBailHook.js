/**
 * @name AsyncParallelBailHook
 * @description 异步并行任务执行，一系列任务监听函数并行执行，只有当任务的callback函数返回值为true的时候,触发callAsync，并且不会终止后续任务的进行。
 */
class AsyncParallelBailHook {
    constructor(args){
        this._args = args;
        this.asyncTaps = [];
        this.promiseTaps = [];
    }
    tapAsync(name,fn){
        this.asyncTaps.push({
            type:"async",
            name,
            fn,
        })
    }
    callAsync(...args){
        let callback = args.pop();
        let params = args.splice(0,this._args.length);
        let index = 0;
        let len = this.asyncTaps.length;
        let done = (...args) => {
            if(args.length === 0 || (args.length ===1 && args[0] === undefined)){
                index ++;
                if(index === len) {
                    callback();
                }
            }else{                                
                callback(...args)
            }
        }
        this.asyncTaps.forEach(tab => tab.fn(...params,done));
    }
    tapPromise(name,fn){
        this.promiseTaps.push({
            type: "promise",
            name,
            fn
        })
    }
    promise(...args){
        let param = args.splice(0,this._args.length);
        let promiseHandle = this.promiseTaps.map((tap, index,arr)=> {
            return new Promise((resolve,reject) => {
                tap.fn(...param).then(x=>{
                    if(index == arr.length - 1){
                        x === undefined ? resolve() : resolve(x);
                    }else{
                        x === undefined ? void 0 : resolve(x);
                    }

                },e=>{
                    if(index == arr.length - 1){
                        e == false ? resolve() : reject(e);
                    }else{
                        !!e == false && typeof e !== 'object'  ? void 0 : reject(e);
                    }
                })
            } )
        });

        return Promise.race(promiseHandle).catch(x=>x);
    }
}

export default AsyncParallelBailHook;