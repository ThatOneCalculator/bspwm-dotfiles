"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSelector = void 0;
var SimpleSelector;
(function (SimpleSelector) {
    /** Selector types. */
    let Type;
    (function (Type) {
        Type[Type["Tag"] = 0] = "Tag";
        Type[Type["Class"] = 1] = "Class";
        Type[Type["Id"] = 2] = "Id";
    })(Type = SimpleSelector.Type || (SimpleSelector.Type = {}));
    /** Create a selector from raw selector string. */
    function create(raw, importURI = null) {
        if (!validate(raw)) {
            return null;
        }
        let type = raw[0] === '.' ? Type.Class
            : raw[0] === '#' ? Type.Id
                : Type.Tag;
        let value = type === Type.Tag ? raw : raw.slice(1);
        return {
            type,
            value,
            raw,
            importURI,
        };
    }
    SimpleSelector.create = create;
    function validate(raw) {
        return /^[#.]?\w[\w-]*$/i.test(raw);
    }
    SimpleSelector.validate = validate;
})(SimpleSelector = exports.SimpleSelector || (exports.SimpleSelector = {}));
//# sourceMappingURL=simple-selector.js.map