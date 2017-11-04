import selfClosingHtmlTags from 'html-tags/void'

/**
 * Clsoes
 * @param  {[type]} $        [description]
 * @param  {[type]} elements [description]
 * @return {[type]}          [description]
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
