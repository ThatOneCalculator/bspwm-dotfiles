"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logListReturnedFunctionExecutedTime = exports.end = exports.start = exports.error = exports.warn = exports.info = exports.log = exports.pipeTo = void 0;
let scopedConsole = console;
function pipeTo(connection) {
    scopedConsole = connection.console;
}
exports.pipeTo = pipeTo;
function getTimeMarker() {
    let date = new Date();
    return '['
        + String(date.getHours())
        + ':'
        + String(date.getMinutes()).padStart(2, '0')
        + ':'
        + String(date.getSeconds()).padStart(2, '0')
        + '] ';
}
function log(msg) {
    scopedConsole.log(getTimeMarker() + msg);
}
exports.log = log;
function info(msg) {
    scopedConsole.info(getTimeMarker() + msg);
}
exports.info = info;
function warn(msg) {
    scopedConsole.warn(getTimeMarker() + msg);
}
exports.warn = warn;
function error(msg) {
    scopedConsole.error(String(msg));
}
exports.error = error;
let startTimeMap = new Map();
function getMillisecond() {
    let time = process.hrtime();
    return time[0] * 1000 + time[1] / 1000000;
}
function start(name) {
    startTimeMap.set(name, getMillisecond());
}
exports.start = start;
function end(name) {
    let startTime = startTimeMap.get(name);
    if (startTime === undefined) {
        console.warn(`Timer "${name}" is not started`);
        return 0;
    }
    startTimeMap.delete(name);
    return Math.round(getMillisecond() - startTime);
}
exports.end = end;
function logListReturnedFunctionExecutedTime(fn, type) {
    return async (...args) => {
        let startTime = getMillisecond();
        let list = await fn(...args);
        let time = Math.round(getMillisecond() - startTime);
        if (list) {
            if (list.length === 0) {
                log(`No ${type} found, ${time} ms cost`);
            }
            else if (list.length === 1) {
                log(`1 ${type} found, ${time} ms cost`);
            }
            else {
                log(`${list.length} ${type}s found, ${time} ms cost`);
            }
        }
        return list;
    };
}
exports.logListReturnedFunctionExecutedTime = logListReturnedFunctionExecutedTime;
//# sourceMappingURL=console.js.map