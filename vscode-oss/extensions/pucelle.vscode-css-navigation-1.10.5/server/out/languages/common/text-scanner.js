"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextScanner = void 0;
class TextScanner {
    constructor(document, offset) {
        this.document = document;
        this.text = document.getText();
        this.offset = offset - 1;
    }
    /** Is in the end of left. */
    isLeftEOS() {
        return this.offset === -1;
    }
    /** Is in the end of right */
    isRightEOS() {
        return this.offset === this.text.length;
    }
    /** Read current char, and moves to left. */
    readLeftChar() {
        return this.text.charAt(this.offset--);
    }
    /** Read current char, and moves to right. */
    readRightChar() {
        return this.text.charAt(this.offset++);
    }
    /** Peek next char in the left. */
    peekLeftChar(forward = 0) {
        return this.text.charAt(this.offset - forward);
    }
    /** Peek next char in the right. */
    peekRightChar(backward = 0) {
        return this.text.charAt(this.offset + backward);
    }
    /** Peek next char in the left, skips white spaces. */
    peekLeftCharSkipWhiteSpaces(forward = 0) {
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
    /** Peek next char in the left, skips white spaces. */
    peekRightCharSkipWhiteSpaces(backward = 0) {
        let offset = this.offset;
        let forwardCount = 0;
        while (offset < this.text.length) {
            let char = this.text.charAt(offset);
            if (!/\s/.test(char)) {
                if (forwardCount === backward) {
                    return char;
                }
                forwardCount++;
            }
            offset++;
        }
        return '';
    }
    /** Moves left. */
    moveLeft(forward = 1) {
        this.offset -= forward;
    }
    /** Moves right. */
    moveRight(backward = 1) {
        this.offset += backward;
    }
    /** Read word at moves cursor to left word boundary. */
    readLeftWord() {
        let endPosition = this.offset + 1;
        while (endPosition < this.text.length) {
            let char = this.text[endPosition];
            if (/[\w\-]/.test(char)) {
                endPosition++;
            }
            else {
                break;
            }
        }
        while (!this.isLeftEOS()) {
            let char = this.peekLeftChar();
            if (/[\w\-]/.test(char)) {
                this.moveLeft();
            }
            else {
                break;
            }
        }
        return this.text.slice(this.offset + 1, endPosition);
    }
    /** Read word at moves cursor to right word boundary. */
    readRightWord() {
        let startPosition = this.offset - 1;
        while (startPosition >= 0) {
            let char = this.text[startPosition];
            if (/[\w\-]/.test(char)) {
                startPosition--;
            }
            else {
                break;
            }
        }
        while (!this.isRightEOS()) {
            let char = this.peekRightChar();
            if (/[\w\-]/.test(char)) {
                this.moveRight();
            }
            else {
                break;
            }
        }
        return this.text.slice(startPosition + 1, this.offset);
    }
    /** Read chars to left until meet any of `chars`. */
    readLeftUntil(chars, maxCharCount = 1024) {
        let endPosition = this.offset;
        let count = 0;
        while (!this.isLeftEOS() && count++ < maxCharCount) {
            let char = this.readLeftChar();
            if (chars.includes(char)) {
                break;
            }
        }
        return this.text.slice(this.offset + 1, endPosition + 1);
    }
    /** Read chars to right until meet any of `chars`. */
    readRightUntil(chars, maxCharCount = 1024) {
        let startPosition = this.offset;
        let count = 0;
        while (!this.isRightEOS() && count++ < maxCharCount) {
            let char = this.readRightChar();
            if (chars.includes(char)) {
                break;
            }
        }
        return this.text.slice(startPosition, this.offset);
    }
    /** Skip white spaces in left position. */
    skipLeftWhiteSpaces() {
        while (!this.isLeftEOS()) {
            let char = this.peekLeftChar();
            if (/\s/.test(char)) {
                this.moveLeft();
            }
            else {
                break;
            }
        }
    }
    /** Skip white spaces in right position. */
    skipRightWhiteSpaces() {
        while (!this.isRightEOS()) {
            let char = this.peekRightChar();
            if (/\s/.test(char)) {
                this.moveRight();
            }
            else {
                break;
            }
        }
    }
}
exports.TextScanner = TextScanner;
//# sourceMappingURL=text-scanner.js.map