/**
 * @name SyncWaterfallHook
 * @description 同步串行任务执行，一系列任务中，当前任务监听函数的返回值，作为下一个任务监听函数的参数。
 */
class SyncWaterfallHook{
    constructor(args){
        this._args = args;
        this.taps = [];
    }
    tap(name,fn){
        this.taps.push({
            type: "sync",
            name,
            fn
        })
    }
    call(...args){
        let param = args.splice(0,this._args.length);
        let [first, ...other] = this.taps;
        other.reduce((result,next) => {
            return result === undefined ? next.fn(...param) : next.fn(result);
        },first.fn(...param))
    }
}
export default SyncWaterfallHook;