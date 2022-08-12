import { bodyRegExps, namedReferences } from './named-references';
import { numericUnicodeMap } from './numeric-unicode-map';
import { fromCodePoint, getCodePoint } from './surrogate-pairs';
const allNamedReferences = {
    ...namedReferences,
    all: namedReferences.html5
};
const encodeRegExps = {
    specialChars: /[<>'"&]/g,
    nonAscii: /(?:[<>'"&\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g,
    nonAsciiPrintable: /(?:[<>'"&\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g,
    extensive: /(?:[\x01-\x0c\x0e-\x1f\x21-\x2c\x2e-\x2f\x3a-\x40\x5b-\x60\x7b-\x7d\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g
};
const defaultEncodeOptions = {
    mode: 'specialChars',
    level: 'all',
    numeric: 'decimal'
};
/** Encodes all the necessary (specified by `level`) characters in the text */
export function encode(text, { mode = 'specialChars', numeric = 'decimal', level = 'all' } = defaultEncodeOptions) {
    if (!text) {
        return '';
    }
    const encodeRegExp = encodeRegExps[mode];
    const references = allNamedReferences[level].characters;
    const isHex = numeric === 'hexadecimal';
    encodeRegExp.lastIndex = 0;
    let replaceMatch_1 = encodeRegExp.exec(text);
    let replaceResult_1;
    if (replaceMatch_1) {
        replaceResult_1 = '';
        let replaceLastIndex_1 = 0;
        do {
            if (replaceLastIndex_1 !== replaceMatch_1.index) {
                replaceResult_1 += text.substring(replaceLastIndex_1, replaceMatch_1.index);
            }
            const replaceInput_1 = replaceMatch_1[0];
            let result_1 = references[replaceInput_1];
            if (!result_1) {
                const code_1 = replaceInput_1.length > 1 ? getCodePoint(replaceInput_1, 0) : replaceInput_1.charCodeAt(0);
                result_1 = (isHex ? '&#x' + code_1.toString(16) : '&#' + code_1) + ';';
            }
            replaceResult_1 += result_1;
            replaceLastIndex_1 = replaceMatch_1.index + replaceInput_1.length;
        } while ((replaceMatch_1 = encodeRegExp.exec(text)));
        if (replaceLastIndex_1 !== text.length) {
            replaceResult_1 += text.substring(replaceLastIndex_1);
        }
    }
    else {
        replaceResult_1 =
            text;
    }
    return replaceResult_1;
}
const defaultDecodeOptions = {
    scope: 'body',
    level: 'all'
};
const strict = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g;
const attribute = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g;
const baseDecodeRegExps = {
    xml: {
        strict,
        attribute,
        body: bodyRegExps.xml
    },
    html4: {
        strict,
        attribute,
        body: bodyRegExps.html4
    },
    html5: {
        strict,
        attribute,
        body: bodyRegExps.html5
    }
};
const decodeRegExps = {
    ...baseDecodeRegExps,
    all: baseDecodeRegExps.html5
};
const fromCharCode = String.fromCharCode;
const outOfBoundsChar = fromCharCode(65533);
const defaultDecodeEntityOptions = {
    level: 'all'
};
/** Decodes a single entity */
export function decodeEntity(entity, { level = 'all' } = defaultDecodeEntityOptions) {
    if (!entity) {
        return '';
    }
    let decodeResult_1 = entity;
    const decodeEntityLastChar_1 = entity[entity.length - 1];
    if (false
        && decodeEntityLastChar_1 === '=') {
        decodeResult_1 =
            entity;
    }
    else if (false
        && decodeEntityLastChar_1 !== ';') {
        decodeResult_1 =
            entity;
    }
    else {
        const decodeResultByReference_1 = allNamedReferences[level].entities[entity];
        if (decodeResultByReference_1) {
            decodeResult_1 = decodeResultByReference_1;
        }
        else if (entity[0] === '&' && entity[1] === '#') {
            const decodeSecondChar_1 = entity[2];
            const decodeCode_1 = decodeSecondChar_1 == 'x' || decodeSecondChar_1 == 'X'
                ? parseInt(entity.substr(3), 16)
                : parseInt(entity.substr(2));
            decodeResult_1 =
                decodeCode_1 >= 0x10ffff
                    ? outOfBoundsChar
                    : decodeCode_1 > 65535
                        ? fromCodePoint(decodeCode_1)
                        : fromCharCode(numericUnicodeMap[decodeCode_1] || decodeCode_1);
        }
    }
    return decodeResult_1;
}
/** Decodes all entities in the text */
export function decode(text, { level = 'all', scope = level === 'xml' ? 'strict' : 'body' } = defaultDecodeOptions) {
    if (!text) {
        return '';
    }
    const decodeRegExp = decodeRegExps[level][scope];
    const references = allNamedReferences[level].entities;
    const isAttribute = scope === 'attribute';
    const isStrict = scope === 'strict';
    decodeRegExp.lastIndex = 0;
    let replaceMatch_2 = decodeRegExp.exec(text);
    let replaceResult_2;
    if (replaceMatch_2) {
        replaceResult_2 = '';
        let replaceLastIndex_2 = 0;
        do {
            if (replaceLastIndex_2 !== replaceMatch_2.index) {
                replaceResult_2 += text.substring(replaceLastIndex_2, replaceMatch_2.index);
            }
            const replaceInput_2 = replaceMatch_2[0];
            let decodeResult_2 = replaceInput_2;
            const decodeEntityLastChar_2 = replaceInput_2[replaceInput_2.length - 1];
            if (isAttribute
                && decodeEntityLastChar_2 === '=') {
                decodeResult_2 = replaceInput_2;
            }
            else if (isStrict
                && decodeEntityLastChar_2 !== ';') {
                decodeResult_2 = replaceInput_2;
            }
            else {
                const decodeResultByReference_2 = references[replaceInput_2];
                if (decodeResultByReference_2) {
                    decodeResult_2 = decodeResultByReference_2;
                }
                else if (replaceInput_2[0] === '&' && replaceInput_2[1] === '#') {
                    const decodeSecondChar_2 = replaceInput_2[2];
                    const decodeCode_2 = decodeSecondChar_2 == 'x' || decodeSecondChar_2 == 'X'
                        ? parseInt(replaceInput_2.substr(3), 16)
                        : parseInt(replaceInput_2.substr(2));
                    decodeResult_2 =
                        decodeCode_2 >= 0x10ffff
                            ? outOfBoundsChar
                            : decodeCode_2 > 65535
                                ? fromCodePoint(decodeCode_2)
                                : fromCharCode(numericUnicodeMap[decodeCode_2] || decodeCode_2);
                }
            }
            replaceResult_2 += decodeResult_2;
            replaceLastIndex_2 = replaceMatch_2.index + replaceInput_2.length;
        } while ((replaceMatch_2 = decodeRegExp.exec(text)));
        if (replaceLastIndex_2 !== text.length) {
            replaceResult_2 += text.substring(replaceLastIndex_2);
        }
    }
    else {
        replaceResult_2 =
            text;
    }
    return replaceResult_2;
}
