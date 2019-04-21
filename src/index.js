const {
    SyncHook,
    SyncBailHook,
    SyncLoopHook,
    SyncWaterfallHook,
    AsyncParallelBailHook,
    AsyncParallelHook,
    AsyncSeriesBailHook,
    AsyncSeriesHook,
    AsyncSeriesWaterfallHook
} = require("../dist/tapable.development");

const hook = new AsyncSeriesHook(['name']);
hook.tapPromise("1",(name) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(name);
            resolve();
        },1000)
    });
})
hook.tapPromise("2",(name) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(name);
            resolve();
        },2000)
    });
})
hook.tapPromise("3",(name) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(name);
            resolve();
        },3000)
    });
})
hook.promise("tapable").then(x => {
    console.log(x);
})
