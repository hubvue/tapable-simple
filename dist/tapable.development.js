'use strict';

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
        });
    }
    call(...args){
        let param = args.splice(0,this._args.length);
        this.taps.forEach(tap => tap.fn(...param));
    }
}

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
        });
    }
    call(...args){
        let  param = args.splice(0,this._args.length);
        this.taps.some(tap =>tap.fn(...param) !== undefined);
    }
}

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
        });
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
        });
    }
    call(...args){
        let param = args.splice(0,this._args.length);
        let [first, ...other] = this.taps;
        other.reduce((result,next) => {
            return result === undefined ? next.fn(...param) : next.fn(result);
        },first.fn(...param));
    }
}

/**
 * @name AsyncParallelHook
 * @description 异步并行任务执行。任务间没有联系，所有任务执行完之后，执行callAsync的回调函数。
 */
class AsyncParallelHook {
    constructor(args) {
        this._args = args;
        this.asyncTaps = [];
        this.promiseTaps = [];
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
        });
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
        };
        this.asyncTaps.forEach(tap => tap.fn(...args,done));
    }
}

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
        });
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
                callback(...args);
            }
        };
        this.asyncTaps.forEach(tab => tab.fn(...params,done));
    }
    tapPromise(name,fn){
        this.promiseTaps.push({
            type: "promise",
            name,
            fn
        });
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
                });
            } )
        });

        return Promise.race(promiseHandle).catch(x=>x);
    }
}

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
        });
    }
    callAsync(...args){
        let callback = args.pop();
        let len = this.asyncTaps.length;
        let [first, ...other] = this.asyncTaps;
        let param = args.splice(0, len);
        let index = 0;
        let done = () => {
            index < other.length ? other[index].fn(...param,done) : void 0; 
            index ++;
            if(index == len){
                callback();
            }        };
        first.fn(...param,done);    
    }
    tapPromise(name,fn){
        this.promiseTaps.push({
            type: "promise",
            name,
            fn
        });
    }
    promise(...args){
        let param = args.splice(0,this._args.length);
        let [first, ...other] = this.promiseTaps;
        let result = other.reduce((prev,next) => prev.then(x=> next.fn(...param)), first.fn(...param));
        return result;
    }
}

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
        });
    }
    callAsync(...args){
        let callback = args.pop();
        let len = this.asyncTaps.length;
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
            }        };
        first.fn(...param,done);    
    }
    tapPromise(name,fn){
        this.promiseTaps.push({
            type: "promise",
            name,
            fn
        });
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
            });
        });
        return promiseHandle;
    }
}

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
        });
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
            }        };
        first.fn(...param,done);
    }
    tapPromise(name,fn){
        this.promiseTaps.push({
            type: "promise",
            fn,
            name
        });
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
            });
        });
        return promiseHandle;
    }
}

/**
 * @name Tapable
 * 
 */

var Tapable = {
    SyncHook,
    SyncBailHook,
    SyncLoopHook,
    SyncWaterfallHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook,
};

module.exports = Tapable;
