"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProvider = void 0;
const util_1 = require("./util");
class HoverProvider {
    provideHover(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = util_1.getMatchAtPosition(document, position);
            if (!result) {
                return;
            }
            const meta = yield util_1.getMdiMetaData();
            const icon = meta.find(i => result.iconName === i.name);
            if (!icon) {
                const hover = {
                    range: result.range,
                    contents: [`no preview available for mdi-${result.iconName}`],
                };
                return hover;
            }
            const iconData = yield util_1.getIconData(icon);
            const hover = {
                range: result.range,
                contents: [
                    iconData.icon,
                    iconData.tags,
                    `aliases: ${iconData.aliases}`,
                    iconData.link,
                ],
            };
            return hover;
        });
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hover.js.map