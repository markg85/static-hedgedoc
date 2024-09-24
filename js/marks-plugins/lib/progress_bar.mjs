import Plugin from 'markdown-it-regexp';

function truncate(num, places) {
    return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
}

const pluginInstance = new Plugin(
  /\[progress\s+(\d+\.?\d*)\s*(\d+\.?\d*)?\s*(\d+\.?\d*)?\s*"?(.*?)"?\]/i,
  
  (match, utils, options, env) => {
    const [_, currentStr, startStr, endStr, template] = match;
    
    let start = parseFloat(startStr || 0);
    let end = parseFloat(endStr || 100);
    const current = parseFloat(currentStr);

    if (isNaN(start)) {
        start = 0;
    }
    if (isNaN(end)) {
        end = 100;
    }

    // Calculate the width of the progress bar
    const progressWidth = ((current - start) / (end - start)) * 100;

    let formattedValues = [];
    let progressBarHTML = `<div class="progress">`;
    progressBarHTML += `<div class="progress-bar" role="progressbar" style="width: ${truncate(progressWidth, 2)}%;" aria-valuenow="${truncate(current, 2)}" aria-valuemin="${truncate(start, 2)}" aria-valuemax="${truncate(end, 2)}">`;

    if (template) {
      const regex = /\{(\d+|%)(?::\.(\d+))?\}/g;
      let match;
      
      while ((match = regex.exec(template)) !== null) {
        let value = 0;
        let precision = 0;

        if (match[1] === '%') {
            value = parseFloat(progressWidth);
        } else {
            value = parseFloat(match[1] === '1' ? currentStr : match[1] === '2' ? startStr : endStr);
        }
        
        precision = match[2] ? parseInt(match[2], 10) : 0;
        formattedValues.push(value.toFixed(precision));
      }

      progressBarHTML += template.replace(regex, () => formattedValues.shift());
    } else {
      progressBarHTML += '';
    }

    progressBarHTML += `</div></div>`;
    
    return progressBarHTML;
  }
);

export default pluginInstance;