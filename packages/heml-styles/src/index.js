'use strict'

import postcss from 'postcss'
import safeParser from 'postcss-safe-parser'

// third party plugins
import calc from 'postcss-calc'
import rgbToHex from 'postcss-rgba-hex'
import colorNamesToHex from 'postcss-colornames-to-hex'
import rgbaFallback from 'postcss-color-rgba-fallback'
import formatHexColors from 'postcss-hex-format'
import emailImportant from 'postcss-email-important'

// custom plugins
import shorthandExpand from './plugins/postcss-shorthand-expand'
import elementExpander from '.plugins/postcss-element-expander'

function hemlstyles (contents, options = {}) {
  const elements = options.elements || {}
  const aliases = options.aliases || {}
  const plugins = options.plugins || []
  const $dom = options.$dom || null

  return postcss(plugins.concat([
    // expand margin, background,
    shorthandExpand(),

    // trying to make calc work
    calc(),

    // color handling
    colorNamesToHex(),
    rgbToHex({ rgbOnly: true, silent: true }),
    rgbaFallback(),
    formatHexColors(),

    // // expanding to match heml things
    elementExpander({ elements, aliases, $dom }),

    // making important work
    emailImportant()
  ]))
  .process(contents, { parser: safeParser })
}

module.exports = hemlstyles
