import Plugin from 'markdown-it-regexp'

const pluginInstance = new Plugin(
    // regexp to match
    /^\[TOC\]$/i,
  
    (match, utils, options, env) => '<div class="toc"></div>'
)

export default pluginInstance;