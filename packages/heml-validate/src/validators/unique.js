import { HEMLError } from '@heml/utils'

export default function unique ($node, { tagName, unique: shouldBeUnique }, $) {
  const $nodes = $.findNodes(tagName)

  if ($nodes.length > 1 && shouldBeUnique) {
    /** remove all but the first $node */
    $nodes.slice(1).forEach(($node) => $node.remove())

    throw new HEMLError(`${tagName} should be unique. ${$nodes.length} were found.`, $node)
  }
}
