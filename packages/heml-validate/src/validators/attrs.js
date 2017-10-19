import { HEMLError } from '@heml/utils'
import { difference } from 'lodash'

const nativeAttrs = [ 'id', 'class', 'dir', 'lang', 'accesskey', 'tabindex', 'title', 'translate' ]

export default function attrs ($node, { tagName, attrs: allowedAttrs, defaultAttrs }) {
  /** allow any attributes through */
  if (allowedAttrs === true) { return }

  allowedAttrs = allowedAttrs
                  .concat(Object.keys(defaultAttrs))
                  .concat(nativeAttrs)

  const usedAttrs = Object.keys($node.get(0).attribs)

  const foundNotAllowedAttrs = difference(usedAttrs, allowedAttrs)

  if (foundNotAllowedAttrs.length > 0) {
    /** remove non-whitelisted attributes */
    foundNotAllowedAttrs.forEach((attr) => $node.removeAttr(attr))

    const plural = foundNotAllowedAttrs.length > 1
    throw new HEMLError(`Attribute${plural ? 's' : ''} ${foundNotAllowedAttrs.join(', ')} ${plural ? 'are' : 'is'} not allowed on ${tagName}.`, $node)
  }
}
