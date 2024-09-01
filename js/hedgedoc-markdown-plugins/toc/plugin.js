import { Optional } from '@mrdrogdrog/optional';
import { encode as htmlencode } from 'html-entities';
import { renderAstToHtml } from './toc-body-renderer.js';
import { defaultOptions } from './toc-options.js';
class Plugin {
    tocOptions;
    currentAst;
    START_LEVEL_ATTRIBUTE_NAME = 'startLevel';
    END_LEVEL_ATTRIBUTE_NAME = 'endLevel';
    TOC_PLACEHOLDER = /^(?:\[\[toc(?::(\d+):(\d+))?]]|\[toc(?::(\d+):(\d+))?])$/i;
    constructor(md, tocOptions) {
        this.tocOptions = {
            ...defaultOptions,
            ...tocOptions
        };
        md.renderer.rules.tocOpen = this.renderTocOpen.bind(this);
        md.renderer.rules.tocClose = this.renderTocClose.bind(this);
        md.renderer.rules.tocBody = this.renderTocBody.bind(this);
        md.core.ruler.push('generateTocAst', (state) => this.generateTocAst(state.tokens));
        md.block.ruler.before('heading', 'toc', this.generateTocToken.bind(this), {
            alt: ['paragraph', 'reference', 'blockquote']
        });
    }
    generateTocToken(state, startLine, _endLine, silent) {
        const pos = state.bMarks[startLine] + state.tShift[startLine];
        const max = state.eMarks[startLine];
        const lineFirstToken = state.src.slice(pos, max).split(' ')[0];
        const matches = this.TOC_PLACEHOLDER.exec(lineFirstToken);
        if (matches === null) {
            return false;
        }
        if (silent) {
            return true;
        }
        state.line = startLine + 1;
        const tocOpenToken = state.push('tocOpen', 'nav', 1);
        tocOpenToken.markup = '';
        tocOpenToken.map = [startLine, state.line];
        const tocBodyToken = state.push('tocBody', '', 0);
        tocBodyToken.markup = '';
        tocBodyToken.map = [startLine, state.line];
        tocBodyToken.children = [];
        const startLevel = matches[3];
        const endLevel = matches[4];
        if (startLevel !== undefined && endLevel !== undefined) {
            tocBodyToken.attrSet(this.START_LEVEL_ATTRIBUTE_NAME, startLevel);
            tocBodyToken.attrSet(this.END_LEVEL_ATTRIBUTE_NAME, endLevel);
        }
        const tocCloseToken = state.push('tocClose', 'nav', -1);
        tocCloseToken.markup = '';
        return true;
    }
    generateTocAst(tokens) {
        this.currentAst = this.headings2ast(tokens);
        this.tocOptions.callback?.(this.currentAst);
    }
    renderTocOpen() {
        const id = this.tocOptions.containerId ? ` id="${htmlencode(this.tocOptions.containerId)}"` : '';
        return `<nav${id} class="${htmlencode(this.tocOptions.containerClass)}">`;
    }
    renderTocClose() {
        return '</nav>';
    }
    createNumberRangeArray(from, to) {
        return Array.from(Array(to - from + 1).keys()).map((value) => value + from);
    }
    renderTocBody(tokens, index) {
        const bodyToken = tokens[index];
        const startLevel = Optional.ofNullable(bodyToken?.attrGet(this.START_LEVEL_ATTRIBUTE_NAME))
            .map(parseInt)
            .filter(isFinite)
            .orElse(null);
        const endLevel = Optional.ofNullable(bodyToken?.attrGet(this.END_LEVEL_ATTRIBUTE_NAME))
            .map(parseInt)
            .filter(isFinite)
            .orElse(null);
        const modifiedTocOptions = startLevel !== null && endLevel !== null && startLevel <= endLevel
            ? { ...this.tocOptions, level: this.createNumberRangeArray(startLevel, endLevel) }
            : this.tocOptions;
        return this.currentAst ? renderAstToHtml(this.currentAst, modifiedTocOptions) : '';
    }
    headings2ast(tokens) {
        const ast = { level: 0, name: '', children: [] };
        const stack = [ast];
        for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
            const token = tokens[tokenIndex];
            if (token.type !== 'heading_open') {
                continue;
            }
            const nextToken = tokens[tokenIndex + 1];
            const key = (nextToken?.children ?? [])
                .filter((token) => this.tocOptions.allowedTokenTypes.includes(token.type))
                .reduce((s, t) => s + t.content, '');
            const node = {
                level: parseInt(token.tag.slice(1), 10),
                name: key,
                children: []
            };
            if (node.level > stack[0].level) {
                stack[0].children.push(node);
                stack.unshift(node);
            }
            else if (node.level === stack[0].level) {
                stack[1].children.push(node);
                stack[0] = node;
            }
            else {
                while (node.level <= stack[0].level)
                    stack.shift();
                stack[0].children.push(node);
                stack.unshift(node);
            }
        }
        return ast;
    }
}
export const toc = (md, options) => new Plugin(md, options);
//# sourceMappingURL=plugin.js.map