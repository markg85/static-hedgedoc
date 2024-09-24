/* Plugin template

import Plugin from 'markdown-it-regexp'

const pluginInstance = new Plugin(
  // regexp to match
  /<REGULAR EXPRESSION TO MATCH ON>/i,

  // match: the match from the above regular expression. A plugin only enters this function if the expression matches. This is an array with the matches.
  // utils: Don't use utils. Use "md.utils.escapeHtml" if escaping html is required.
  // options: same as md.options only this is per-token
  // env: don't know
  (match, utils, options, env) => '<div class="example"></div>'
)

export default pluginInstance;


Usage description

Create a new file in the `marks-plugins/lib` folder with your plugin content.
Edit the `marks-plugins/index.mjs` file where you add an expery for your new plugin. Like so:
export { MyNewPlugin } from './lib/my_new_plugin.mjs'

Now the conditions are done to use it. To use it, in your main js file you'd use it as follows:
import markdownIt from 'markdown-it'
import { MyNewPlugin } from 'marks-plugins'
const md = markdownIt().use(MyNewPlugin);

And that's it, your plugin is now loaded.

*/