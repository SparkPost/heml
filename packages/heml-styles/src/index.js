import postcss from 'postcss'
import safeParser from 'postcss-safe-parser'

/** optimize css - credz to cssnano */
import discardComments from 'postcss-discard-comments'
import minifyGradients from 'postcss-minify-gradients'
import normalizeDisplayValues from 'postcss-normalize-display-values'
import normalizeTimingFunctions from 'postcss-normalize-timing-functions'
import convertValues from 'postcss-convert-values'
import reduceCalc from 'postcss-calc'
import orderedValues from 'postcss-ordered-values'
import minifySelectors from 'postcss-minify-selectors'
import minifyParams from 'postcss-minify-params'
import discardOverridden from 'postcss-discard-overridden'
import normalizeString from 'postcss-normalize-string'
import minifyFontValues from 'postcss-minify-font-values'
import normalizeRepeatStyle from 'postcss-normalize-repeat-style'
import normalizePositions from 'postcss-normalize-positions'
import discardEmpty from 'postcss-discard-empty'
import discardUnused from 'postcss-discard-unused'
import uniqueSelectors from 'postcss-unique-selectors'
import declarationSorter from 'css-declaration-sorter'
import mergeAdjacentMedia from './plugins/postcss-merge-adjacent-media'
import discardDuplicates from 'postcss-discard-duplicates'
import mergeRules from 'postcss-merge-rules'

/** format colors */
import rgbToHex from 'postcss-rgba-hex'
import colorNamesToHex from 'postcss-colornames-to-hex'
import rgbaFallback from 'postcss-color-rgba-fallback'
import formatHexColors from 'postcss-hex-format'

/** email fixes */
import emailImportant from 'postcss-email-important'

/** custom plugins */
import shorthandExpand from './plugins/postcss-expand-shorthand'
import elementExpander from './plugins/postcss-element-expander'

async function hemlstyles (contents, options = {}) {
  const {
    elements = {},
    aliases = {},
    plugins = []
  } = options

  return postcss([
    ...plugins,

    /** optimize css */
    discardComments(),
    minifyGradients(),
    normalizeDisplayValues(),
    normalizeTimingFunctions(),
    convertValues({ length: false }),
    reduceCalc(),
    orderedValues(),
    minifySelectors(),
    minifyParams(),
    discardOverridden(),
    normalizeString(),
    minifyFontValues({ removeQuotes: false }),
    normalizeRepeatStyle(),
    normalizePositions(),
    discardEmpty(),
    discardUnused(),
    uniqueSelectors(),
    declarationSorter(),
    mergeAdjacentMedia(),
    discardDuplicates(),
    mergeRules(),

    /** color handling */
    colorNamesToHex(),
    rgbToHex({ rgbOnly: true, silent: true }),
    rgbaFallback(),
    formatHexColors(),

    /** email fixes */
    emailImportant(),

    /** expanding to match heml elements */
    shorthandExpand(), // so we can match for margin-left/margin-right etc.
    elementExpander({ elements, aliases })
  ])
  .process(contents, { parser: safeParser })
}

export default hemlstyles
