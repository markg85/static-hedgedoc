function defaultSlugify(name) {
    return encodeURIComponent(String(name).trim().toLowerCase().replace(/\s+/g, '-'));
}
export const defaultOptions = {
    uniqueSlugStartIndex: 0,
    containerClass: 'table-of-contents',
    containerId: '',
    listClass: '',
    itemClass: '',
    linkClass: '',
    level: 1,
    listType: 'ol',
    allowedTokenTypes: ['text', 'code_inline'],
    slugify: defaultSlugify
};
//# sourceMappingURL=toc-options.js.map