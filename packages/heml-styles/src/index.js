'use strict'

import postcss from 'postcss'
import safeParser from 'postcss-safe-parser'

// third party plugins
import cssnano from 'cssnano'
import rgbToHex from 'postcss-rgba-hex'
import colorNamesToHex from 'postcss-colornames-to-hex'
import rgbaFallback from 'postcss-color-rgba-fallback'
import formatHexColors from 'postcss-hex-format'
import emailImportant from 'postcss-email-important'

// custom plugins
import shorthandExpand from './plugins/postcss-shorthand-expand'
import elementExpander from '.plugins/postcss-element-expander'

function hemlstyles (contents, options = {}) {
  const {
    cssnano: cssnanoOptions = {}
    elements = [],
    plugins = [],
    $ = null
  } = options

  return postcss(plugins.concat([
    // minify css
    cssnano({
      preset: ['advanced'],
      ...cssnanoOptions
    }),

    // expand margin, background, font
    shorthandExpand(),

    // color handling
    colorNamesToHex(),
    rgbToHex({ rgbOnly: true, silent: true }),
    rgbaFallback(),
    formatHexColors(),

    // // expanding to match heml things
    elementExpander({ elements, $ }),

    // making important work in email
    emailImportant()
  ]))
  .process(contents, { parser: safeParser })
}

module.exports = hemlstyles
