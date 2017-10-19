import { min, max } from 'lodash'

export default class HEMLError extends Error {
  constructor (message, $node) {
    super(message)
    this.name = 'HEMLError'

    if ($node) {
      this.$node = $node
      this.selector = buildExactSelector($node)
    }

    Error.captureStackTrace(this, HEMLError)
  }
}

function buildExactSelector ($node) {
  const nodeSelector = buildSelector($node[0])
  const strSelector = $node.parents()
      .map((index, node) => buildSelector(node))
      .toArray()
      .reverse()
      .concat([nodeSelector])
      .join(' > ')

  const chopAfter = min(max(0, strSelector.lastIndexOf('#')),
      max(0, strSelector.lastIndexOf('html')),
      max(0, strSelector.lastIndexOf('heml')))

  return strSelector.substr(chopAfter)
}

function buildSelector (node) {
  if (node.id) {
    return `#${node.id}`
  }

  const tag = node.tagName.toLowerCase()
  const siblingsBefore = findSiblingsBefore(node)
  const siblingsAfter = findSiblingsAfter(node)
  const siblings = siblingsBefore.concat(siblingsAfter)

  const sameTag = siblings.filter((s) => s.tagName.toLowerCase() === tag)

  if (siblings.length === 0 || sameTag.length === 0) {
    return tag
  }

  const sameTagAndClass = siblings.filter((s) => s.className === node.className && s.tagName.toLowerCase() === tag)

  if (node.className && sameTagAndClass.length === 0) {
    return `${tag}.${node.className.split(' ').join('.')}`
  }

  return `${tag}:nth-child(${siblingsBefore.length + 1})`
}

function findSiblingsBefore (node, siblings = []) {
  if (!node.previousSibling) { return siblings }

  if (node.previousSibling.tagName) { siblings = siblings.concat([node.previousSibling]) }

  return findSiblingsBefore(node.previousSibling, siblings)
}

function findSiblingsAfter (node, siblings = []) {
  if (!node.nextSibling) { return siblings }

  if (node.nextSibling.tagName) { siblings = siblings.concat([node.nextSibling]) }

  return findSiblingsAfter(node.nextSibling, siblings)
}
