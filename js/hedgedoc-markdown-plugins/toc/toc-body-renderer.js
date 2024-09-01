import { encode as htmlencode } from 'html-entities';
export function renderAstToHtml(tree, tocOptions) {
    if (tree.children.length === 0) {
        return '';
    }
    let buffer = '';
    const tag = htmlencode(tocOptions.listType);
    if (tree.level === 0 || isLevelSelected(tree.level, tocOptions.level)) {
        const listClass = tocOptions.listClass !== '' ? ` class="${htmlencode(tocOptions.listClass)}"` : '';
        buffer += `<${tag + listClass}>`;
    }
    const usedSlugs = [];
    const parts = tree.children.map((node) => {
        const subNodesHtml = renderAstToHtml(node, tocOptions);
        if (isLevelSelected(node.level, tocOptions.level)) {
            const anchorContent = htmlencode(tocOptions.format?.(node.name) ?? node.name);
            const anchorId = generateUniqueSlug(node.name, tocOptions, usedSlugs);
            usedSlugs.push(anchorId);
            const itemClass = tocOptions.itemClass !== '' ? ` class="${htmlencode(tocOptions.itemClass)}"` : '';
            const linkClass = tocOptions.linkClass !== '' ? ` class="${htmlencode(tocOptions.linkClass)}"` : '';
            return `<li${itemClass}><a${linkClass} href="#${anchorId}">${anchorContent}</a>${subNodesHtml}</li>`;
        }
        else {
            return subNodesHtml;
        }
    });
    buffer += parts.join('');
    if (tree.level === 0 || isLevelSelected(tree.level, tocOptions.level)) {
        buffer += `</${tag}>`;
    }
    return buffer;
}
function isLevelSelected(level, levels) {
    return Array.isArray(levels) ? levels.includes(level) : level >= levels;
}
function generateUniqueSlug(slug, tocOptions, usedSlugs) {
    for (let index = tocOptions.uniqueSlugStartIndex; index < Number.MAX_VALUE; index += 1) {
        const slugCandidate = tocOptions.slugify(slug, index);
        const slugWithIndex = index === 0 ? slugCandidate : `${slugCandidate}-${index}`;
        if (!usedSlugs.includes(slugWithIndex)) {
            return slugWithIndex;
        }
    }
    throw new Error('Too many slug with same name');
}
//# sourceMappingURL=toc-body-renderer.js.map