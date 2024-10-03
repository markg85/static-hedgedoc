import katex from './KaTeX/katex.mjs';

/**
 * Test if potential opening or closing delimiter
 * Assumes that there is a "$" at state.src[pos]
 * @param {Object} state
 * @param {number} pos
 * @returns {Object} { can_open: boolean, can_close: boolean }
 */
function isValidDelim(state, pos) {
    const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
    const nextChar = pos + 1 <= state.posMax ? state.src.charCodeAt(pos + 1) : -1;

    // Check non-whitespace conditions for opening and closing, and
    // check that closing delimiter isn't followed by a number
    const canClose = !(prevChar === 0x20 || prevChar === 0x09 || (nextChar >= 0x30 && nextChar <= 0x39));
    const canOpen = nextChar !== 0x20 && nextChar !== 0x09;

    return { canOpen, canClose };
}

/**
 * @param {Object} state
 * @param {boolean} silent
 * @returns {boolean}
 */
function mathInline(state, silent) {
    if (state.src[state.pos] !== "$") return false;

    let res = isValidDelim(state, state.pos);
    if (!res.canOpen) {
        if (!silent) state.pending += "$";
        state.pos += 1;
        return true;
    }

    // First check for and bypass all properly escaped delimiters
    let start = state.pos + 1;
    let match = start;
    while ((match = state.src.indexOf("$", match)) !== -1) {
        // Found potential $, look for escapes, pos will point to
        // first non escape when complete
        let pos = match - 1;
        while (state.src[pos] === "\\") pos -= 1;

        // Even number of escapes, potential closing delimiter found
        if ((match - pos) % 2 === 1) break;
        match += 1;
    }

    // No closing delimiter found. Consume $ and continue.
    if (match === -1) {
        if (!silent) state.pending += "$";
        state.pos = start;
        return true;
    }

    // Check if we have empty content, ie: $$. Do not parse.
    if (match - start === 0) {
        if (!silent) state.pending += "$$";
        state.pos = start + 1;
        return true;
    }

    // Check for valid closing delimiter
    res = isValidDelim(state, match);
    if (!res.canClose) {
        if (!silent) state.pending += "$";
        state.pos = start;
        return true;
    }

    if (!silent) {
        const token = state.push("math_inline", "math", 0);
        token.markup = "$";
        token.content = state.src.slice(start, match);
    }

    state.pos = match + 1;
    return true;
}

/**
 * @param {Object} state
 * @param {number} start
 * @param {number} end
 * @param {boolean} silent
 * @returns {boolean}
 */
function mathBlock(state, start, end, silent) {
    let pos = state.bMarks[start] + state.tShift[start];
    let max = state.eMarks[start];

    if (pos + 2 > max) return false;
    if (state.src.slice(pos, pos + 2) !== "$$") return false;

    let firstLine, lastLine, next, lastPos, found = false, token;
    let content = "";

    pos += 2;
    firstLine = state.src.slice(pos, max);

    if (silent) return true;
    if (firstLine.trim().slice(-2) === "$$") {
        // Single line expression
        firstLine = firstLine.trim().slice(0, -2);
        found = true;
    }

    for (next = start; !found; ) {
        next++;

        if (next >= end) break;

        pos = state.bMarks[next] + state.tShift[next];
        max = state.eMarks[next];

        if (pos < max && state.tShift[next] < state.blkIndent) {
            // non-empty line with negative indent should stop the list:
            break;
        }

        if (state.src.slice(pos, max).trim().slice(-2) === "$$") {
            lastPos = state.src.slice(0, max).lastIndexOf("$$");
            lastLine = state.src.slice(pos, lastPos);
            found = true;
        }
    }

    state.line = next + 1;

    if (!found) return false;

    if (firstLine && firstLine.trim()) content += firstLine + "\n";
    content += state.getLines(start + 1, next, state.tShift[start], true);
    if (lastLine && lastLine.trim()) content += lastLine;

    token = state.push("math_block", "math", 0);
    token.block = true;
    token.content = content;
    token.map = [start, state.line];
    token.markup = "$$";
    return true;
}

/**
 * @param {Object} md
 * @param {Object} options
 */
export default function mathPlugin(md, options) {
    // Default options
    options = options || {};

    // set KaTeX as the renderer for markdown-it-simplemath
    const katexInline = (latex) => {
        options.displayMode = false;
        try {
            return katex.renderToString(latex, options);
        } catch (error) {
            if (options.throwOnError) console.log(error);
            return latex;
        }
    };

    const inlineRenderer = (tokens, idx) => katexInline(tokens[idx].content);

    const katexBlock = (latex) => {
        options.displayMode = true;
        try {
            return "<p>" + katex.renderToString(latex, options) + "</p>";
        } catch (error) {
            if (options.throwOnError) console.log(error);
            return latex;
        }
    };

    const blockRenderer = (tokens, idx) => katexBlock(tokens[idx].content) + "\n";

    md.inline.ruler.after("escape", "math_inline", mathInline);
    md.block.ruler.after("blockquote", "math_block", mathBlock, {
        alt: ["paragraph", "reference", "blockquote", "list"],
    });
    md.renderer.rules.math_inline = inlineRenderer;
    md.renderer.rules.math_block = blockRenderer;
}