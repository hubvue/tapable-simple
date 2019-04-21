/**
 * @name AsyncSeriesHook
 * @description 异步串行任务执行，一系列监听函数间没有联系，只有执行完当前任务才会执行下一个任务。
 */
class AsyncSeriesHook {
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
        let done = () => {
            index < other.length ? other[index].fn(...param,done) : void 0; 
            index ++;
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
        let result = other.reduce((prev,next) => prev.then(x=> next.fn(...param)), first.fn(...param));
        return result;
    }
}
export default AsyncSeriesHook;