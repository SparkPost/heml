import { HEMLError } from '@heml/utils'
import { isArray, intersection, difference } from 'lodash'

export default function children ($node, { tagName, children: requiredChildren }) {
  if (isArray(requiredChildren)) {
    const children = $node.children().toArray().map((c) => c.name)

    const foundRequiredChildren = intersection(requiredChildren, children)

    if (foundRequiredChildren.length < requiredChildren.length) {
      const missingRequiredChildren = difference(requiredChildren, foundRequiredChildren)

      throw new HEMLError(`${tagName} is missing required children: ${missingRequiredChildren}`, $node)
    }
  }
};
