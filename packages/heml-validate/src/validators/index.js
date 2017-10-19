'use strict'

import HEMLError from 'heml/Error'
const _ = require('lodash')

module.exports = function attrs ($node, { tagName, attrs: allowedAttrs, defaultAttrs }) {
  allowedAttrs = allowedAttrs.concat(_.keys(defaultAttrs)).concat([
    'id', 'class', 'dir', 'lang', 'accesskey', 'tabindex', 'title', 'translate' ])

  const usedAttrs = _.keys($node.get(0).attribs)

  const foundNotAllowedAttrs = _.difference(usedAttrs, allowedAttrs)

  if (foundNotAllowedAttrs.length > 0) {
    _.each(foundNotAllowedAttrs, (attr) => $node.removeAttr(attr)) // strip em for soft/none

    const plural = foundNotAllowedAttrs.length > 1
    throw new HEMLError($node, `Attribute${plural ? 's' : ''} ${foundNotAllowedAttrs.join(', ')} ${plural ? 'are' : 'is'} not allowed on ${tagName}.`)
  }
}
