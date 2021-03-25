"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requests_1 = require("./requests");
function setState(state) {
    return requests_1.tabNineProcess.request({ SetState: { state_type: state } });
}
exports.default = setState;
//# sourceMappingURL=setState.js.map