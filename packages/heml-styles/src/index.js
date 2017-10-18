import postcss from 'postcss'
import safeParser from 'postcss-safe-parser'

// third party plugins
import cssnano from 'cssnano'
import rgbToHex from 'postcss-rgba-hex'
import colorNamesToHex from 'postcss-colornames-to-hex'
import rgbaFallback from 'postcss-color-rgba-fallback'
import formatHexColors from 'postcss-hex-format'
import emailImportant from 'postcss-email-important'
import discardDuplicates from 'postcss-discard-duplicates'

// custom plugins
import shorthandExpand from './plugins/postcss-expand-shorthand'
import elementExpander from './plugins/postcss-element-expander'
import mergeAdjacentMedia from './plugins/postcss-merge-adjacent-media'

async function hemlstyles (contents, options = {}) {
  const {
    cssnano: cssnanoOptions = {},
    elements = {},
    aliases = {},
    plugins = []
  } = options

  return postcss(plugins.concat([
    /** minify css */
    cssnano({
      preset: ['advanced', {
        discardComments: { exclude: true },
        discardDuplicates: { exclude: true },
        reduceInitial: { exclude: true },
        reduceTransforms: { exclude: true },
        colormin: { exclude: true },
        minifySelectors: { exclude: true },
        minifyFontValues: { exclude: true },
        normalizeWhitespace: { exclude: true },
        rawCache: { exclude: true },
        zindex: { exclude: true }
      }],
      ...cssnanoOptions
    }),

    /** merge @media queries that are next to each other with the same value */
    mergeAdjacentMedia(),

    /** remove duplicate rules */
    discardDuplicates(),

    /** expand margin, background, font */
    shorthandExpand(),

    /** color handling */
    colorNamesToHex(),
    rgbToHex({ rgbOnly: true, silent: true }),
    rgbaFallback(),
    formatHexColors(),

    /** making important work in yahoo */
    emailImportant(),

    /** expanding to match heml elements */
    elementExpander({ elements, aliases })
  ]))
  .process(contents, { parser: safeParser })
}

export default hemlstyles
