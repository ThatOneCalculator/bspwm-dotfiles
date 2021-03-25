"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForwardScanner = void 0;
class ForwardScanner {
    constructor(document, offset) {
        this.document = document;
        this.text = document.getText();
        this.offset = offset - 1;
    }
    eos() {
        return this.offset === -1;
    }
    read() {
        return this.text.charAt(this.offset--);
    }
    peek(forward = 0) {
        return this.text.charAt(this.offset - forward);
    }
    peekSkipWhiteSpaces(forward = 0) {
        let offset = this.offset;
        let forwardCount = 0;
        while (offset >= 0) {
            let char = this.text.charAt(offset);
            if (!/\s/.test(char)) {
                if (forwardCount === forward) {
                    return char;
                }
                forwardCount++;
            }
            offset--;
        }
        return '';
    }
    /** Moves right. */
    back() {
        this.offset++;
    }
    /** Moves left. */
    forward() {
        this.offset--;
    }
    /** Read word at when cursor at the end of the word: `word[HERE]`. */
    readWord() {
        let startPosition = this.offset;
        while (!this.eos()) {
            let char = this.read();
            if (!/[\w\-]/.test(char)) {
                this.back();
                break;
            }
        }
        return this.text.slice(this.offset + 1, startPosition + 1);
    }
    /** Read word at when cursor at the middle of the word: `wo[HERE]rd`. */
    readWholeWord() {
        let startPosition = this.offset + 1;
        while (startPosition < this.text.length) {
            let char = this.text[startPosition];
            if (/[\w\-]/.test(char)) {
                startPosition++;
            }
            else {
                break;
            }
        }
        this.readWord();
        return this.text.slice(this.offset + 1, startPosition);
    }
    // Include the until char
    readUntil(chars, maxCharCount = 1024) {
        let startPosition = this.offset;
        let count = 0;
        let untilChar = '';
        while (!this.eos() && count++ < maxCharCount) {
            let char = this.read();
            if (chars.includes(char)) {
                untilChar = char;
                break;
            }
        }
        return [untilChar, this.text.slice(this.offset + 1, startPosition + 1)];
    }
    skipWhiteSpaces() {
        while (!this.eos()) {
            let char = this.read();
            if (!/\s/.test(char)) {
                this.back();
                break;
            }
        }
    }
}
exports.ForwardScanner = ForwardScanner;
//# sourceMappingURL=forward-scanner.js.map