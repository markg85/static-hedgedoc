import { SpecialCharacters } from './specialCharacters.js';
function isCharacterADigit(code) {
    return code >= SpecialCharacters.NUMBER_ZERO && code <= SpecialCharacters.NUMBER_NINE;
}
function findNextNotNumberCharacter(startPosition, maximalPosition, content) {
    for (let position = startPosition; position < maximalPosition; position += 1) {
        const code = content.charCodeAt(position);
        if (!isCharacterADigit(code) && code !== SpecialCharacters.PERCENTAGE) {
            return position;
        }
    }
    return maximalPosition;
}
function parseNextNumber(content, startPosition, maximalPosition) {
    const endCharacterIndex = findNextNotNumberCharacter(startPosition, maximalPosition, content);
    return {
        position: endCharacterIndex,
        value: content.slice(startPosition, endCharacterIndex)
    };
}
const checkImageSizeStart = (code) => {
    return (code === SpecialCharacters.LOWER_CASE_X ||
        (code >= SpecialCharacters.NUMBER_ZERO && code <= SpecialCharacters.NUMBER_NINE));
};
export function parseImageSize(imageSize, startCharacterPosition, maximalCharacterPosition) {
    if (startCharacterPosition >= maximalCharacterPosition) {
        return;
    }
    let currentCharacterPosition = startCharacterPosition;
    if (imageSize.charCodeAt(currentCharacterPosition) !== SpecialCharacters.EQUALS) {
        return;
    }
    currentCharacterPosition += 1;
    if (!checkImageSizeStart(imageSize.charCodeAt(currentCharacterPosition))) {
        return;
    }
    const width = parseNextNumber(imageSize, currentCharacterPosition, maximalCharacterPosition);
    currentCharacterPosition = width.position;
    const code = imageSize.charCodeAt(currentCharacterPosition);
    if (code !== SpecialCharacters.LOWER_CASE_X) {
        return;
    }
    currentCharacterPosition += 1;
    const height = parseNextNumber(imageSize, currentCharacterPosition, maximalCharacterPosition);
    currentCharacterPosition = height.position;
    return {
        width: width.value,
        height: height.value,
        position: currentCharacterPosition
    };
}
//# sourceMappingURL=parse-image-size.js.map