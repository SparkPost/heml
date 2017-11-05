import { load } from 'cheerio'
import closeSelfClosingNodes from './closeSelfClosingNodes'
import openWrappingNodes from './openWrappingNodes'
import extractInlineStyles from './extractInlineStyles'
import safeSelectorize from './safeSelectorize'

function parse (contents, options = {}) {
  const {
    elements = [],
    cheerio: cheerioOptions = {}
  } = options

  const $ = load(contents, {
    xmlMode: true,
    lowerCaseTags: true,
    decodeEntities: false,
    ...cheerioOptions
  })

  $.findNodes = function (q) {
    return $(Array.isArray(q) ? q.join(',') : q)
            .not('[heml-ignore]')
            .toNodes()
  }

  $.prototype.toNodes = function () {
    return this
            .toArray()
            .map((node) => $(node))
  }

  closeSelfClosingNodes($, elements)
  openWrappingNodes($, elements)
  extractInlineStyles($, elements)
  safeSelectorize($, elements)

  return $
}

export default parse
