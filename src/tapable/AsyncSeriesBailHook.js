/**
 * @name AsyncSeriesBailHook
 * @description 异步串行任务执行，一系列任务监听函数中，当哪个监听函数callback抛出错误，则终止任务执行.
 */
class AsyncSeriesBailHook {
    constructor(args){
        this._args = args;
        this.asyncTaps = [];
        this.promiseTaps = [];
    }
    tapAsync(name,fn){
        this.asyncTaps.push({
            type: "async",
            fn,
            name
        })
    }
    callAsync(...args){
        let callback = args.pop();
        let len = this.asyncTaps.length
        let [first, ...other] = this.asyncTaps;
        let param = args.splice(0, len);
        let index = 0;
        let done = (...args) => {
            if(args.length === 0 || (args.length === 1 && args[0] === undefined)){
                index < other.length ? other[index].fn(...param,done) : void 0; 
                index ++;
            } else {
                callback(...args);
            }                     
            if(index == len){
                callback();
            };
        }
        first.fn(...param,done);    
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
        let [first, ...other] = this.promiseTaps;
        let promiseHandle = new Promise((resolve, reject) => {
            let result = other.reduce((prev,next,idx,arr) =>{
                return prev.then(x=> {
                    return  arr.length !== 0 ? next.fn(...param) : void 0;
                },e=>{
                    arr.splice(idx,arr.length);
                    e === undefined ? next.fn(...param) : reject(e);
                })
            },first.fn(...param));
            result.then(() => {
                resolve();
            })
        })
        return promiseHandle;
    }
}
export default AsyncSeriesBailHook;