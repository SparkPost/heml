import { load } from 'cheerio'
import { difference, compact, first } from 'lodash'
import randomString from 'crypto-random-string'
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

  const $selfClosingNodes = $.findNodes(selfClosingTags).reverse()
  const $wrappingNodes = $.findNodes(wrappingTags).reverse()

  /** Move contents from self wrapping tags outside of itself */
  $selfClosingNodes.forEach(($node) => {
    $node.after($node.html())
    $node.html('')
  })

  /** ensure that all wrapping tags have at least a zero-width, non-joining character */
  $wrappingNodes.forEach(($node) => {
    if ($node.html().length === 0) {
      $node.html(' ')
    }
  })

  /** try for head, fallback to body, then heml */
  const $head = first(compact([...$('head').toNodes(), ...$('body').toNodes(), ...$('heml').toNodes()]))

  /** move inline styles to a style tag with unique ids so they can be hit by the css processor */
  if ($head) {
    const $inlineStyleNodes = $.findNodes(elements.map(({ tagName }) => tagName)).filter($node => !!$node.attr('style'))

    const inlineCSS = $inlineStyleNodes.map(($node) => {
      let id = $node.attr('id')
      const css = $node.attr('style')
      $node.removeAttr('style')

      if (!id) {
        id = `heml-${randomString(5)}`
        $node.attr('id', id)
      }

      return `#${id} {${css}}`
    }).join('\n')

    $head.append(`<style>${inlineCSS}</style>`)
  }

  return $
}

export default parse
