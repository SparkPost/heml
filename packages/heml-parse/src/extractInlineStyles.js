import randomString from 'crypto-random-string'
import { compact, first } from 'lodash'

/**
 * This extracts all inline styles on elements into a style tag to be inlined later
 * so that the styles can be properly expanded and later re-inlined
 * @param  {Cheerio} $
 * @param  {Array}   elements
 */
export default function($, elements) {
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

    if (inlineCSS.length > 0) $head.append(`<style>${inlineCSS}</style>`)
  }
}
