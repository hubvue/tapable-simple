/**
 * @name AsyncSeriesWaterfallHook
 * @description 异步串行任务执行，一系列监听函数中，当前监听函数的返回值可作为下一个监听函数的参数，如果执行过程中哪个监听函数的callback返回了err，则任务终止并且执行callAsync绑定的callback。
 */
class AsyncSeriesWaterfallHook {
    constructor(args){
        this._args = args;
        this.asyncTaps = [];
        this.promiseTaps = [];
    }
    tapAsync(name,fn){
        this.asyncTaps.push({
            type: "async",
            name,
            fn
        })
    }
    callAsync(...args){
        let callback = args.pop();
        let param = args.splice(0,this._args.length);
        let [first, ...other] = this.asyncTaps;
        let index = 0;
        let len = this.asyncTaps.length;
        let done = (err,data) => {
            if(err == undefined){
                index < other.length ? data === undefined ? other[index].fn(...param,done) : other[index].fn(data,done) : void 0; 
                index ++;
            } else {
                callback(err);
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
            fn,
            name
        })
    }
    promise(...args){
        let param = args.splice(0,this._args.length);
        let [first, ...other] = this.promiseTaps;
        let promiseHandle = new Promise((resolve, reject) => {
            let result = other.reduce((prev, next,idx,arr) => {
                return prev.then(x=> {
                    return arr.length !== 0 ? x === undefined ? next.fn(...param) : next.fn(x) : void 0;
                },e => {
                    reject(e);
                    arr.splice(idx,arr.length);      
                });
            },first.fn(...param));
            result.then(x=> {
                x === undefined ? resolve(...param) : resolve(x);
            })
        })
        return promiseHandle;
    }
}
export default AsyncSeriesWaterfallHook;