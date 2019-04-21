/**
 * @name SyncBailHook
 * @description 同步串行任务执行，一些列任务中，如果让前任务的返回值可转换为false(undefine 不算) ，则终止任务进行。
 */
class SyncBailHook {
    constructor(args){
        this._args = args;
        this.taps = [];
    }
    tap(name,fn){
        this.taps.push({
            type: "sync",
            name,
            fn,
        })
    }
    call(...args){
        let  param = args.splice(0,this._args.length);
        this.taps.some(tap =>tap.fn(...param) !== undefined);
    }
}
export default SyncBailHook;