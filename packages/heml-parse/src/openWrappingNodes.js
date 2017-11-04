import htmlTags from 'html-tags'
import selfClosingHtmlTags from 'html-tags/void'
import { difference } from 'lodash'

const wrappingHtmlTags = difference(htmlTags, selfClosingHtmlTags)


export default function($, elements) {
  /** collect all the wrapping nodes */
  const wrappingTags = [
    ...wrappingHtmlTags,
    ...elements.filter((element) => element.children !== false).map(({ tagName }) => tagName) ]

  const $wrappingNodes = $.findNodes(wrappingTags).reverse()

  /** ensure that all wrapping tags have at least a space */
  $wrappingNodes.forEach(($node) => {
    if ($node.html().length === 0) {
      $node.html(' ')
    }
  })
}
