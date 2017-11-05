import selfClosingHtmlTags from 'html-tags/void'

/**
 * The HEML is parsed as XML. If the HEML contains a self closing tag without the closing slash
 * all the siblings will be treated as children. This moves the children back to their place and
 * forces the tag to be self closing
 * @param  {Cheerio} $
 * @param  {Array}   elements
 */
export default function($, elements) {
  /** collect all the self closing nodes */
  const selfClosingTags = [
    ...selfClosingHtmlTags,
    ...elements.filter((element) => element.children === false).map(({ tagName }) => tagName) ]

  const $selfClosingNodes = $.findNodes(selfClosingTags).reverse()

  /** Move contents from self wrapping tags outside of itself */
  $selfClosingNodes.forEach(($node) => {
    $node.after($node.html())
    $node.html('')
  })
}
