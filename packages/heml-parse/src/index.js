import { load } from 'cheerio'
import { difference } from 'lodash'
import htmlTags from 'html-tags'
import selfClosingHtmlTags from 'html-tags/void'

const wrappingHtmlTags = difference(htmlTags, selfClosingHtmlTags)

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

  const selfClosingTags = [
    ...selfClosingHtmlTags,
    ...elements.filter((element) => element.children === false).map(({ tagName }) => tagName) ]
  const wrappingTags = [
    ...wrappingHtmlTags,
    ...elements.filter((element) => element.children !== false).map(({ tagName }) => tagName) ]

  const selfClosingNodes = $.findNodes(selfClosingTags).reverse()
  const wrappingNodes = $.findNodes(wrappingTags).reverse()

  /** Move contents from self wrapping tags outside of itself */
  selfClosingNodes.forEach(($node) => {
    $node.after($node.html())
    $node.html('')
  })

  /** ensure that all wrapping tags have at least a zero-width, non-joining character */
  wrappingNodes.forEach(($node) => {
    if ($node.html().length === 0) {
      $node.html(' ')
    }
  })

  return $
}

export default parse
