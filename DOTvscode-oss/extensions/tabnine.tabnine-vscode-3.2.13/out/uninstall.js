"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runBinary_1 = require("./binary/runBinary");
main().catch(console.error);
async function main() {
    const code = await reportUninstall("--uninstalled");
    process.exit(code);
}
function reportUninstall(uninstallType) {
    return new Promise((resolve, reject) => {
        void runBinary_1.default([uninstallType], true).then(({ proc }) => {
            proc.on("exit", (code, signal) => {
                if (signal) {
                    reject(new Error(`TabNine aborted with ${signal} signal`));
                }
                resolve(code !== null && code !== void 0 ? code : undefined);
            });
            proc.on("error", (err) => {
                reject(err);
            });
        }, (err) => {
            reject(err);
        });
    });
}
//# sourceMappingURL=uninstall.js.map