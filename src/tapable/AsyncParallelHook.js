/**
 * @name AsyncParallelHook
 * @description 异步并行任务执行。任务间没有联系，所有任务执行完之后，执行callAsync的回调函数。
 */
class AsyncParallelHook {
    constructor(args) {
        this._args = args;
        this.asyncTaps = [];
        this.promiseTaps = []
    }
    tapAsync(name,fn){
        this.asyncTaps.push({
            type: "async",
            name,
            fn
        });                    
    }
    tapPromise(name,fn){
        this.promiseTaps.push({
            type: "promise",
            name,
            fn
        })
    }
    promise(...args){
        let param = args.splice(0,this.promiseTaps.length);
        let promiseHandle = this.promiseTaps.map((tap) => tap.fn(...param));
        return Promise.all(promiseHandle).then(x=>{});
    }
    callAsync(...args){
        let callback = args.pop();
        let index = 0;
        let len = this.asyncTaps.length;
        let done = () => {
            index ++;
            if(index === len){
                callback();
            }
        }
        this.asyncTaps.forEach(tap => tap.fn(...args,done))
    }
}
export default AsyncParallelHook;