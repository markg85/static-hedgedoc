import Plugin from 'markdown-it-regexp';

const truncate = (num, places = 2) => Math.trunc(num * 10 ** places) / 10 ** places;

const parseValue = valueStr => 
    isNaN(parseFloat(valueStr)) ? undefined : parseFloat(valueStr);

const createProgressBarHTML = ({ current, start, end, template }) => {
    const calculatedProgressWidth = ((current - start) / (end - start)) * 100;
    return `<div class="progress"><div class="progress-bar" role="progressbar" style="width: ${truncate(calculatedProgressWidth)}%;" aria-valuenow="${truncate(current)}" aria-valuemin="${truncate(start)}" aria-valuemax="${truncate(end)}">` +
        (template ? template.replace(/\{(\d+|%)(?::\.(\d+))?\}/g, match => {
            const value = match[1] === '%'
                ? calculatedProgressWidth
                : parseFloat(match[1] === '1' ? current : match[1] === '2' ? start : end);
            const precision = match[2] ? parseInt(match[2], 10) : 0;
            return value.toFixed(precision);
        }) : '') +
        `</div></div>`;
};

const pluginInstance = new Plugin(
  /\[progress\s+([\d.]+)\s*([\d.]+)?\s*([\d.]+)?\s*"?(.*?)"?\]/i,
  
  (match, utils, options, env) => {
    const template = match.pop();
    const values = match.slice(1).map(parseValue);
    const [current = 0, start = 0, end = 100] = values;
    return createProgressBarHTML({ current, start, end, template });
  }
);

export default pluginInstance;