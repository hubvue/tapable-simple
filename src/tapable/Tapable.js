/**
 * @name Tapable
 * 
 */
import SyncHook from "./SyncHook";
import SyncBailHook from "./SyncBailHook";
import SyncLoopHook from "./SyncLoopHook";
import SyncWaterfallHook from "./SyncWaterfallHook";
import AsyncParallelHook from "./AsyncParallelHook";
import AsyncParallelBailHook from "./AsyncParallelBailHook";
import AsyncSeriesHook from "./AsyncSeriesHook";
import AsyncSeriesBailHook from "./AsyncSeriesBailHook";
import AsyncSeriesWaterfallHook from "./AsyncSeriesWaterfallHook";

export default {
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