import { HEMLError } from '@heml/utils'

export default function parent ($node, { tagName, parent: allowedParents }) {
  const parentTag = $node.parent().get(0)

  if (!parentTag) { return }

  if (allowedParents.includes(parentTag.name)) {
    return
  }

  let message = `${tagName} is inside of ${parentTag.name}.`

  if (allowedParents.length === 0) {
    message = `${message} It may not have any parents.`
  } else {
    message = `${message} It should only be used in: ${allowedParents.join(', ')}`
  }

  throw new HEMLError(message, $node)
}
