/*!
 * markdown-it-regexp
 * Copyright (c) 2014 Alex Kocharin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import stuff from "./utils.mjs";

/**
 * Counter for multi usage.
 */
let counter = 0

/**
 * Constructor function
 */

export default function Plugin(regexp, replacer) {
  // return value should be a callable function
  // with strictly defined options passed by markdown-it
  const self = function (md, options) {
    self.options = options
    self.init(md)
  };

  // initialize plugin object
  self.__proto__ = Plugin.prototype

  // clone regexp with all the flags
  const flags = (regexp.global ? 'g' : '')
    + (regexp.multiline ? 'm' : '')
    + (regexp.ignoreCase ? 'i' : '');

  self.regexp = RegExp('^' + regexp.source, flags)

  // copy init options
  self.replacer = replacer

  // this plugin can be inserted multiple times,
  // so we're generating unique name for it
  self.id = 'regexp-' + counter
  counter++

  return self
}

function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

inherits(Plugin, Function)

// function that registers plugin with markdown-it
Plugin.prototype.init = function (md) {
  md.inline.ruler.push(this.id, this.parse.bind(this))

  md.renderer.rules[this.id] = this.render.bind(this)
}

Plugin.prototype.parse = function (state, silent) {
  // slowwww... maybe use an advanced regexp engine for this
  var match = this.regexp.exec(state.src.slice(state.pos))
  if (!match) return false

  // valid match found, now we need to advance cursor
  state.pos += match[0].length

  // don't insert any tokens in silent mode
  if (silent) return true

  var token = state.push(this.id, '', 0)
  token.meta = { match: match }

  return true
}

Plugin.prototype.render = function (tokens, id, options, env) {
  return this.replacer(tokens[id].meta.match, stuff, options, env)
}
