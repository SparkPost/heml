import HEML, { createElement } from '@heml/utils' // eslint-disable-line no-unused-vars
import Meta from './Meta'
import isAbsoluteUrl from 'is-absolute-url'
import { join } from 'path'

export default createElement('base', {
  parent: [ 'head' ],
  children: false,
  unique: true,
  defaultAttrs: { href: '' },

  render (attrs, contents) {
    Meta.set('base', attrs.href)

    return false
  },

  postRender ({ $ }) {
    const baseUrl = Meta.get('base')

    if (baseUrl) {
      $('[href], [src]')
        .each((i, node) => {
          if (!isAbsoluteUrl(node.attribs.href)) {
            node.attribs.href = join(baseUrl, node.attribs.href)
          }
        })
    }
  }
})
