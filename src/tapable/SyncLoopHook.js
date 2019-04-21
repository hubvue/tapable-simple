/**
 * @name SyncLoopHook
 * @description 同步串行循环任务执行，一系列任务中，当任务的监听函数的返回值不为undefined，则循环执行，如果为返回值为undefined则终止循环。
 */
class SyncLoopHook{
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
        let index = 0;
        let taps = this.taps;
        while(taps[index]){
            taps[index].fn(...param) === undefined ? index ++ : void 0;
        }
    }
}
export default SyncLoopHook;