import markdownIt from 'markdown-it'
import { imageSize, taskLists, toc } from 'hedgedoc-markdown-plugins'
import { full as emoji } from 'markdown-it-emoji'
import Plugin from 'markdown-it-regexp'
import markdownitContainer from 'markdown-it-container'
import abbr from 'markdown-it-abbr'
import footnote from 'markdown-it-footnote'
import marker from 'markdown-it-mark'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import ins from 'markdown-it-ins'
import deflist from 'markdown-it-deflist'
import { generate } from 'lean-qr'
import { toSvg } from 'lean-qr-svg';
import anchor from 'markdown-it-anchor'
import Papa from 'papaparse';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: true });

// import forinline from 'markdown-it-for-inline'

import hljs from 'hljs'

let langs = [];
let pendingLangs = new Set();

const tocPlugin = new Plugin(
    // regexp to match
    /^\[TOC\]$/i,
  
    (match, utils) => '<div class="toc"></div>'
)

const nowrapPlugin = new Plugin(
    // regexp to match
    /^\[NOWRAP\]$/i,
  
    (match, utils) => 'FUUU'
)

const progressBarPlugin = new Plugin(
    // regexp to match
    /\[PRBAR:(\d{1,3})-(\d{1,3})\]/i,
  
    (match, utils) => {
        return `<div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${parseInt(match[1])}%" aria-valuenow="${parseInt(match[1])}" aria-valuemin="0" aria-valuemax="${parseInt(match[2])}">${parseInt(match[1])}%</div>
                </div>`
    }
)


const md = markdownIt({
    html: true,
    breaks: true,
    langPrefix: '',
    linkify: true,
    typographer: true,
    highlight: highlightRender
  })
  .use(emoji)
  .use(imageSize)
  .use(taskLists)
  .use(tocPlugin)
  .use(nowrapPlugin)
  .use(progressBarPlugin)
  .use(toc, {listType: 'ul'})
  .use(abbr)
  .use(footnote)
  .use(marker)
  .use(sub)
  .use(sup)
  .use(ins)
  .use(deflist)
  .use(anchor, {
    permalink: anchor.permalink.ariaHidden({
      placement: 'before',
      class: 'anchor hidden-xs',
      symbol: '<i class="fa fa-link"></i>'
    })
  })
  .use(markdownitMultimdTable, {
    multiline:  true,
    rowspan:    true,
    headerless: true,
    multibody:  false,
    autolabel:  true,
  })

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
    let langName = ''
    let highlighted
  
    if (info) {
      langName = info.split(/\s+/g)[0]
      if (/!$/.test(info)) token.attrJoin('class', 'wrap')
      token.attrJoin('class', options.langPrefix + langName.replace(/=$|=\d+$|=\+$|!$|=!$/, ''))
      token.attrJoin('class', 'hljs')
    }

    const [langClean, _] = langName.split('=');

    if (langClean === 'csvpreview') {
        return md.render(csvToMarkdown(token.content));
    } else if (langClean === 'qr') {
        return renderQr(langName, token.content)
    } else if (langClean == 'mermaid') {
        return `<div class="mermaid">${token.content}</div>`
    }
  
    if (options.highlight && langClean != '') {
      try {
        highlighted = options.highlight(token.content, langName)
      } catch (__) {
        highlighted = md.utils.escapeHtml(token.content)
      }
    } else {
      highlighted = md.utils.escapeHtml(token.content)
    }

    if (langClean === 'qr') {
        return highlighted;
    }
  
    // if (highlighted.indexOf('<pre') === 0) {
    //   return `${highlighted}\n`
    // }

    const hlclassrequest = `hljs_req_render_${langClean}`

    const showlinenumbers = /=$|=\d+$|=\+$/.test(langName)
    if (showlinenumbers) {
      let startnumber = 1
      const matches = langName.match(/=(\d+)$/)
      if (matches) { startnumber = parseInt(matches[1]) }
      const lines = token.content.split('\n')
      const linenumbers = []
      const continuelinenumber = /=\+$/.test(langName)

      if (continuelinenumber) {
        // consecutive blocks count as one huge block in line numbers
        startnumber += hljs.lastBlockLength - 1;
        hljs.lastBlockLength += lines.length - 1
      } else {
        hljs.lastBlockLength = startnumber + lines.length - 1
      }

      for (let i = 0; i < lines.length - 1; i++) {
        linenumbers[i] = `<span data-linenumber='${startnumber + i}'></span>`
      }

      const linegutter = `<div class='gutter linenumber${continuelinenumber ? ' continue' : ''}'>${linenumbers.join('\n')}</div>`
      highlighted = `<div class='wrapper'>${linegutter}<div class='code ${hlclassrequest}'>${highlighted}</div></div>`
    } else {
        token.attrJoin('class', hlclassrequest)
    }
  
    if (langClean == '') {
        return `<pre><code>${highlighted}</code></pre>\n`
    } else {
        return `<pre><code${self.renderAttrs(token)}>${highlighted}</code></pre>\n`
    }
  }

  md.renderer.rules.blockquote_open = function (tokens, idx, options, env, self) {
    tokens[idx].attrJoin('class', 'raw')
    return self.renderToken(...arguments)
  }

  md.renderer.rules.emoji = function (tokens, idx, options, env, self) {
    // if content starts with fa-
    const tokenMarkup = tokens[idx].markup;
    if (tokenMarkup.startsWith('fa-')) {
      return `<i class="fa ${tokenMarkup.replace(/-fw/g, " fa-fw")}"></i>`
    } else {
      return tokens[idx].content;
    }
  };

  hljs.lastBlockLength = 0;

  function csvToMarkdown(csv) {
    const { data } = Papa.parse(csv, { header: true });
    if (!data.length) return '';
  
    const filteredData = data.filter(row => Object.values(row).some(v => v !== ''));
    const columns = Object.keys(filteredData[0]);
  
    return [
      `| ${columns.join(' | ')} |`,
      `| ${columns.map(() => '---').join(' | ')} |`,
      ...filteredData.map(row => `| ${columns.map(c => row[c]).join(' | ')} |`)
    ].join('\n');
  }

function renderQr(lang, code) {
    const regex = /^qr=(\d+)x(\d+)/;
    const match = lang.match(regex);
    let width = 50;
    let height = 50;
    
    if (match) {
      width = parseInt(match[1], 10) ?? 150;
      height = parseInt(match[2], 10) ?? 150;
    }

    const qrCode = generate(code);
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    toSvg(qrCode, svg, {
        on: 'black',
        off: 'transparent',
        padX: 0,
        padY: 0,
        width,
        height,
        scale: 1,
      });

  return svg.outerHTML
}

  function highlightRender (code, lang) {
    if (!lang || /no(-?)highlight|plain|text/.test(lang)) { return }
    const [langClean, _] = lang.split('=');

    if (langClean === 'sequence') {
      return `<div class="sequence-diagram raw">${code}</div>`
    } else if (langClean === 'flow') {
      return `<div class="flow-chart raw">${code}</div>`
    } else if (langClean === 'graphviz') {
      return `<div class="graphviz raw">${code}</div>`
    } else if (langClean === 'abc') {
      return `<div class="abc raw">${code}</div>`
    }

    const result = {
      value: code
    }

    if (langClean && hljs.getLanguage(langClean)) {
      try {
        result.value = hljs.highlight(code, { language: langClean, ignoreIllegals: true }).value
      } catch (__) {
        result.value = md.utils.escapeHtml(code);
      }
    } else {
      pendingLangs.add(langClean);
      result.value = md.utils.escapeHtml(code);
    }

    return result.value;
  }

// Function to see if lang exists in langs. If it does, load the language file in hljs
async function loadLanguage(lang) {
  if (langs.includes(lang)) {
    try {
        const module = await import(`./hljs/es/languages/${lang}.min.js`);
        hljs.registerLanguage(lang, module.default);
        return true;
     } catch (error) {
        // console.error('import failed');
     }
  }
  return false;
}

function parseSpoilerString(str) {
    const match = str.match(/^spoiler\s*(\{[^}]*\})?\s*(.*)$/);
    return match && {
      text: match[2],
      state: (match[1] && match[1].match(/state="([^"]+)"/)?.[1]) || "closed"
    };
  }

function renderContainer(tokens, idx, options, env, self) {
    tokens[idx].attrJoin('role', 'alert')
    tokens[idx].attrJoin('class', 'alert')
    tokens[idx].attrJoin('class', `alert-${tokens[idx].info.trim()}`)
    return self.renderToken(...arguments)
}

md.use(markdownitContainer, 'success', { render: renderContainer })
md.use(markdownitContainer, 'info', { render: renderContainer })
md.use(markdownitContainer, 'warning', { render: renderContainer })
md.use(markdownitContainer, 'danger', { render: renderContainer })
md.use(markdownitContainer, 'spoiler')


md.renderer.rules.container_spoiler_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const spoilerData = parseSpoilerString(token.info.trim())
    const opened = (spoilerData.state == 'open') ? ' open' : '';

    return `
    <details${opened}>
        <summary>
            <span>
                <span>${spoilerData.text}</span>
            </span>
        </summary>`;
  };

  md.renderer.rules.container_spoiler_close = function (tokens, idx, options, env, self) {
    return `</details>`;
  };

async function postProcess() {
    try {
        const response = await fetch('./js/hljs/es/languages/langs.json')
        langs = await response.json()
    } catch (error) {
        console.error(error)
        return;
    }

    for (const lang of pendingLangs) {
        const loadLangRes = await loadLanguage(lang);
        if (loadLangRes === true) {
            const collection = document.getElementsByClassName(`hljs_req_render_${lang}`);
            for (const obj of collection) {
                obj.innerHTML = hljs.highlight(obj.innerHTML, { language: lang, ignoreIllegals: true }).value
            }

            // I don't know why but this has to be outside of the above loop.. If adding it in then some fences don't get properly highlighted.
            for (const obj of collection) {
                obj.classList.remove(`hljs_req_render_${lang}`);
            }
        } else {
            console.log(`${lang} skipped, no file for it`)
        }
    }

    pendingLangs.clear();

    const collection = document.getElementsByClassName(`mermaid`);
    for (const obj of collection) {
        const type = mermaid.detectType(obj.innerHTML);
        const {svg, bindFunctions} = await mermaid.render(type, obj.innerHTML);
        obj.innerHTML = svg;
    }
}


// Get content from test.md file using fetch
fetch('mainpage.md')
.then(response => response.text())
.then(text => {
  // Convert Markdown to HTML
  const html = md.render(text)

  // Insert HTML into the DOM
  document.body.innerHTML = html
  postProcess()
})
