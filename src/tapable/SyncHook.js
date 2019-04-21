/**
 * @name SyncHook
 * @description 同步串行任务执行，任务间彼此没有联系。当前任务执行完，再执行下一个任务。
 */
class SyncHook {
    constructor(args){
        this._args = args;
        this.taps = [];
    }
    tap(name,fn){
        this.taps.push({
            type: 'sync',
            fn,
            name,
        })
    }
    call(...args){
        let param = args.splice(0,this._args.length);
        this.taps.forEach(tap => tap.fn(...param));
    }
}
export default SyncHook;