import Plugin from 'markdown-it-regexp';

const truncate = (num, places = 2) => Math.trunc(num * 10 ** places) / 10 ** places;

const parseValue = valueStr => 
    isNaN(parseFloat(valueStr)) ? undefined : parseFloat(valueStr);

const createProgressBarHTML = ({ current, start, end, template }) => {
    const calculatedProgressWidth = ((current - start) / (end - start)) * 100;

    // Replace placeholders
    let result = template.replace(/\{(\d+|%)(?::\.(\d+))?}/g, (match, index, precision) => {
        let value;
        
        switch (index) {
            case '1':
                value = current;
                break;
            case '2':
                value = start;
                break;
            case '3':
                value = end;
                break;
            case '%':
                value = calculatedProgressWidth;
                break;
            default:
                return match; // Return the original placeholder if index is invalid
        }

        const precisionValue = precision ? parseInt(precision, 10) : 0;
        return value.toFixed(precisionValue);
    });

    // Add progress bar HTML
    result = `<div class="progress"><div class="progress-bar" role="progressbar" style="width: ${truncate(calculatedProgressWidth)}%;" aria-valuenow="${truncate(current)}" aria-valuemin="${truncate(start)}" aria-valuemax="${truncate(end)}">${result}</div></div>`;

    return result;
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