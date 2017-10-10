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
import shorthandExpand from './plugins/postcss-expand-shorthand'
import elementExpander from './plugins/postcss-element-expander'

async function hemlstyles (contents, options = {}) {
  const {
    cssnano: cssnanoOptions = {},
    elements = {},
    plugins = [],
    $ = null,
    ignoreAttr = 'heml-ignore'
  } = options

  return postcss(plugins.concat([
    // minify css
    // cssnano({
    //   preset: ['advanced', {
    //     discardComments: { exclude: true },
    //     minifyGradients: { exclude: true },
    //     reduceInitial: { exclude: true },
    //     svgo: { exclude: true },
    //     normalizeDisplayValues: { exclude: true },
    //     reduceTransforms: { exclude: true },
    //     colormin: { exclude: true },
    //     normalizeTimingFunctions: { exclude: true },
    //     calc: { exclude: true },
    //     convertValues: { exclude: true },
    //     orderedValues: { exclude: true },
    //     minifySelectors: { exclude: true },
    //     minifyParams: { exclude: true },
    //     normalizeCharset: { exclude: true },
    //     discardOverridden: { exclude: true },
    //     normalizeString: { exclude: true },
    //     normalizeUnicode: { exclude: true },
    //     minifyFontValues: { exclude: true },
    //     normalizeUrl: { exclude: true },
    //     normalizeRepeatStyle: { exclude: true },
    //     normalizePositions: { exclude: true },
    //     normalizeWhitespace: { exclude: true },
    //     mergeLonghand: { exclude: true },
    //     discardDuplicates: { exclude: true },
    //     mergeRules: { exclude: true },
    //     discardEmpty: { exclude: true },
    //     uniqueSelectors: { exclude: true },
    //     cssDeclarationSorter: { exclude: true },
    //     rawCache: { exclude: true },
    //   }],
    //   ...cssnanoOptions
    // }),

    // expand margin, background, font
    shorthandExpand(),

    // color handling
    colorNamesToHex(),
    rgbToHex({ rgbOnly: true, silent: true }),
    // rgbaFallback(),
    formatHexColors(),

    // // expanding to match heml things
    elementExpander({ elements, $ }),

    // making important work in email
    emailImportant()
  ]))
  .process(contents, { parser: safeParser })
}

(async function () {
  const results = await hemlstyles(`
  button {
    background: blue;
    color: white;
  }
`, {
  elements: {
    button: {
      '.button': [ { '@pseudo': 'root' }, { '@default': true }, 'background-color' ],
      '.text': [ { '@pseudo': 'text' }, {'color': function () {} } ]
    }
  }
})

  console.log(results.css)
})()

export default hemlstyles
