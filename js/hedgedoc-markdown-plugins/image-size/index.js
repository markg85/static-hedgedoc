import { parseImageSize } from './parse-image-size.js';
import { SpecialCharacters } from './specialCharacters.js';
const checkForImageTagStart = (state) => {
    return (state.src.charCodeAt(state.pos) === SpecialCharacters.EXCLAMATION_MARK &&
        state.src.charCodeAt(state.pos + 1) === SpecialCharacters.OPENING_BRACKET);
};
const skipWhiteSpaces = (startPosition, state) => {
    let position = startPosition;
    while (position < state.posMax) {
        const code = state.src.charCodeAt(position);
        if (code !== SpecialCharacters.WHITESPACE && code !== SpecialCharacters.NEW_LINE) {
            break;
        }
        position += 1;
    }
    return position;
};
function createImageToken(state, labelStartIndex, labelEndIndex, href, title, width, height) {
    state.pos = labelStartIndex;
    state.posMax = labelEndIndex;
    const token = state.push('image', 'img', 0);
    token.children = [];
    const newState = new state.md.inline.State(state.src.slice(labelStartIndex, labelEndIndex), state.md, state.env, token.children);
    newState.md.inline.tokenize(newState);
    token.attrSet('src', href);
    token.attrSet('alt', '');
    if (title) {
        token.attrSet('title', title);
    }
    if (width !== '') {
        token.attrSet('width', width);
    }
    if (height !== '') {
        token.attrSet('height', height);
    }
}
function parseSizeParameters(startPosition, state) {
    if (startPosition - 1 < 0) {
        return;
    }
    const code = state.src.charCodeAt(startPosition - 1);
    if (code !== SpecialCharacters.WHITESPACE) {
        return;
    }
    const res = parseImageSize(state.src, startPosition, state.posMax);
    if (!res) {
        return;
    }
    return {
        position: skipWhiteSpaces(res.position, state),
        width: res.width,
        height: res.height
    };
}
function parseLink(state, startPosition) {
    const linkParseResult = state.md.helpers.parseLinkDestination(state.src, startPosition, state.posMax);
    if (!linkParseResult.ok) {
        return;
    }
    const href = state.md.normalizeLink(linkParseResult.str);
    if (state.md.validateLink(href)) {
        return { position: linkParseResult.pos, href };
    }
    else {
        return { position: startPosition, href: '' };
    }
}
const imageWithSize = (state, silent) => {
    let position, title, start, href = '', width = '', height = '';
    const oldPos = state.pos, max = state.posMax;
    if (!checkForImageTagStart(state)) {
        return false;
    }
    const labelStartIndex = state.pos + 2;
    const labelEndIndex = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
    if (labelEndIndex < 0) {
        return false;
    }
    position = labelEndIndex + 1;
    if (position < max && state.src.charCodeAt(position) === SpecialCharacters.OPENING_PARENTHESIS) {
        position += 1;
        position = skipWhiteSpaces(position, state);
        if (position >= max) {
            return false;
        }
        const parseLinkResult = parseLink(state, position);
        if (!parseLinkResult) {
            return false;
        }
        position = parseLinkResult.position;
        href = parseLinkResult.href;
        start = position;
        position = skipWhiteSpaces(position, state);
        const parseLinkTitleResult = state.md.helpers.parseLinkTitle(state.src, position, state.posMax);
        if (position < max && start !== position && parseLinkTitleResult.ok) {
            title = parseLinkTitleResult.str;
            position = parseLinkTitleResult.pos;
            position = skipWhiteSpaces(position, state);
        }
        else {
            title = '';
        }
        const parseSizeParametersResult = parseSizeParameters(position, state);
        if (parseSizeParametersResult) {
            position = parseSizeParametersResult.position;
            width = parseSizeParametersResult.width;
            height = parseSizeParametersResult.height;
        }
        if (position >= max || state.src.charCodeAt(position) !== SpecialCharacters.CLOSING_PARENTHESIS) {
            state.pos = oldPos;
            return false;
        }
        position += 1;
    }
    else {
        if (typeof state.env.references === 'undefined') {
            return false;
        }
        position = skipWhiteSpaces(position, state);
        let label;
        if (position < max && state.src.charCodeAt(position) === SpecialCharacters.OPENING_BRACKET) {
            start = position + 1;
            position = state.md.helpers.parseLinkLabel(state, position);
            if (position >= 0) {
                label = state.src.slice(start, (position += 1));
            }
            else {
                position = labelEndIndex + 1;
            }
        }
        else {
            position = labelEndIndex + 1;
        }
        if (!label) {
            label = state.src.slice(labelStartIndex, labelEndIndex);
        }
        const ref = state.env.references?.[state.md.utils.normalizeReference(label)];
        if (!ref) {
            state.pos = oldPos;
            return false;
        }
        href = ref.href;
        title = ref.title;
    }
    if (!silent) {
        createImageToken(state, labelStartIndex, labelEndIndex, href, title, width, height);
    }
    state.pos = position;
    state.posMax = max;
    return true;
};
export const imageSize = (md) => {
    md.inline.ruler.before('emphasis', 'image', imageWithSize);
};
//# sourceMappingURL=index.js.map