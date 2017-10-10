'use strict'

import postcss from 'postcss'

/**
 * elements var looks like this
 *
 * {
 *   button: {
 *     '.button': [ { '@pseudo': 'root' }, { '@default': true }, 'background-color' ],
 *     '.text': [ { '@pseudo': 'text' }, { color: function() { tranform here } } ],
 *   },
 *   ....
 * }
 */

/**
 * Convert CSS to match custom elements
 * @param  {Object} options.elements An object of elements that define how to
 *                                   split up the css for each element
 * @param  {[type]} options.$        A cheerio instance
 */
export default postcss.plugin('postcss-element-expander', ({ elements, $dom }) => {
  return () => {}
})
