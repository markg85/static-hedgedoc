import Token from '../../markdown-it/lib/token.mjs';
const checkboxRegex = /^ *\[([\sx])] /i;
export function taskLists(md, options = { enabled: false, label: false, lineNumber: false }) {
    md.core.ruler.after('inline', 'task-lists', (state) => processToken(state, options));
    md.renderer.rules.taskListItemCheckbox = (tokens) => {
        const token = tokens[0];
        const checkedAttribute = token.attrGet('checked') ? 'checked="" ' : '';
        const disabledAttribute = token.attrGet('disabled') ? 'disabled="" ' : '';
        const line = token.attrGet('line');
        const idAttribute = `id="${token.attrGet('id')}" `;
        const dataLineAttribute = line && options.lineNumber ? `data-line="${line}" ` : '';
        return `<input class="task-list-item-checkbox" type="checkbox" ${checkedAttribute}${disabledAttribute}${dataLineAttribute}${idAttribute}/>`;
    };
    md.renderer.rules.taskListItemLabel_close = () => {
        return '</label>';
    };
    md.renderer.rules.taskListItemLabel_open = (tokens) => {
        const token = tokens[0];
        const id = token.attrGet('id');
        return `<label for="${id}">`;
    };
}
function processToken(state, options) {
    const allTokens = state.tokens;
    for (let i = 2; i < allTokens.length; i++) {
        if (!isTodoItem(allTokens, i)) {
            continue;
        }
        todoify(allTokens[i], options);
        allTokens[i - 2].attrJoin('class', `task-list-item ${options.enabled ? ' enabled' : ''}`);
        const parentToken = findParentToken(allTokens, i - 2);
        if (parentToken) {
            const classes = parentToken.attrGet('class') ?? '';
            if (!classes.match(/(^| )contains-task-list/)) {
                parentToken.attrJoin('class', 'contains-task-list');
            }
        }
    }
    return false;
}
function findParentToken(tokens, index) {
    const targetLevel = tokens[index].level - 1;
    for (let currentTokenIndex = index - 1; currentTokenIndex >= 0; currentTokenIndex--) {
        if (tokens[currentTokenIndex].level === targetLevel) {
            return tokens[currentTokenIndex];
        }
    }
    return undefined;
}
function isTodoItem(tokens, index) {
    return (isInline(tokens[index]) &&
        isParagraph(tokens[index - 1]) &&
        isListItem(tokens[index - 2]) &&
        startsWithTodoMarkdown(tokens[index]));
}
function todoify(token, options) {
    if (token.children == null) {
        return;
    }
    const id = generateIdForToken(token);
    token.children.splice(0, 0, createCheckboxToken(token, options.enabled, id));
    token.children[1].content = token.children[1].content.replace(checkboxRegex, '');
    if (options.label) {
        token.children.splice(1, 0, createLabelBeginToken(id));
        token.children.push(createLabelEndToken());
    }
}
function generateIdForToken(token) {
    if (token.map) {
        return `task-item-${token.map[0]}`;
    }
    else {
        return `task-item-${Math.ceil(Math.random() * (10000 * 1000) - 1000)}`;
    }
}
function createCheckboxToken(token, enabled, id) {
    const checkbox = new Token('taskListItemCheckbox', '', 0);
    if (!enabled) {
        checkbox.attrSet('disabled', 'true');
    }
    if (token.map) {
        checkbox.attrSet('line', token.map[0].toString());
    }
    checkbox.attrSet('id', id);
    const checkboxRegexResult = checkboxRegex.exec(token.content);
    const isChecked = checkboxRegexResult?.[1].toLowerCase() === 'x';
    if (isChecked) {
        checkbox.attrSet('checked', 'true');
    }
    return checkbox;
}
function createLabelBeginToken(id) {
    const labelBeginToken = new Token('taskListItemLabel_open', '', 1);
    labelBeginToken.attrSet('id', id);
    return labelBeginToken;
}
function createLabelEndToken() {
    return new Token('taskListItemLabel_close', '', -1);
}
function isInline(token) {
    return token.type === 'inline';
}
function isParagraph(token) {
    return token.type === 'paragraph_open';
}
function isListItem(token) {
    return token.type === 'list_item_open';
}
function startsWithTodoMarkdown(token) {
    return checkboxRegex.test(token.content);
}
//# sourceMappingURL=index.js.map
