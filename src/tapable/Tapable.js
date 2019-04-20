/**
 * @name Tapable
 * 
 */
const SyncHook = require("./SyncHook");
const SyncBailHook = require("./SyncBailHook");
const SyncLoopHook = require("./SyncLoopHook");
const SyncWaterfallHook = require("./SyncWaterfallHook");
const AsyncParallelHook = require("./AsyncParallelHook");
const AsyncParallelBailHook = require("./AsyncParallelBailHook");
const AsyncSeriesHook = require("./AsyncSeriesHook");
const AsyncSeriesBailHook = require("./AsyncSeriesBailHook");
const AsyncSeriesWaterfallHook = require("./AsyncSeriesWaterfallHook");

module.exports = {
    SyncHook,
    SyncBailHook,
    SyncLoopHook,
    SyncWaterfallHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook,
}