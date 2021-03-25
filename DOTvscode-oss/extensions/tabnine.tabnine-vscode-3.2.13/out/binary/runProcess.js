"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProcess = void 0;
const child_process_1 = require("child_process");
const readline_1 = require("readline");
const reporter_1 = require("../reporter");
function runProcess(command, args, options) {
    if (process.env.NODE_ENV === "test") {
        // eslint-disable-next-line
        return require("./mockedRunProcess").default();
    }
    reporter_1.report(reporter_1.EventName.START_BINARY);
    const proc = child_process_1.spawn(command, args, options);
    const readLine = readline_1.createInterface({
        input: proc.stdout,
        output: proc.stdin,
    });
    return { proc, readLine };
}
exports.runProcess = runProcess;
//# sourceMappingURL=runProcess.js.map